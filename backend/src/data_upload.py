
"""
NexaRetail - Retailer Data Upload & Inspection

Handles CSV/XLS/XLSX uploads and performs lightweight dataset detection.
This step does NOT run the ML pipeline.
"""

import os
import difflib
import re
import uuid
from pathlib import Path

import pandas as pd


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
PREVIEW_ROWS = 10

UPLOAD_DIR = Path(__file__).parent.parent / "data" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------------------------
# Dataset detection signatures
# ---------------------------------------------------------------------------

DATASET_SIGNATURES = {
    "transactions": {
        "transaction_id": [
            "transaction_id",
            "transactionid",
            "order_id",
            "orderid",
            "invoice_id",
            "receipt_id",
        ],
        "date": [
            "date",
            "transaction_date",
            "order_date",
            "sale_date",
            "invoice_date",
        ],
        "product": [
            "product_id",
            "productid",
            "product",
            "sku",
            "item_id",
            "item",
        ],
        "quantity": [
            "quantity",
            "qty",
            "units",
            "units_sold",
            "quantity_sold",
        ],
        "customer": [
            "customer_id",
            "customerid",
            "customer",
            "buyer_id",
        ],
        "price": [
            "price",
            "unit_price",
            "selling_price",
            "sale_price",
            "amount",
            "revenue",
        ],
    },

    "products": {
        "product": [
            "product_id",
            "productid",
            "product",
            "product_name",
            "item_id",
            "item_name",
            "sku",
        ],
        "category": [
            "category",
            "subcategory",
            "product_category",
        ],
        "brand": [
            "brand",
            "brand_name",
        ],
        "price": [
            "price",
            "selling_price",
            "unit_price",
            "cost",
            "unit_cost",
        ],
        "description": [
            "description",
            "product_description",
        ],
    },

    "inventory": {
        "product": [
            "product_id",
            "productid",
            "sku",
            "item_id",
            "item",
        ],
        "stock": [
            "stock",
            "stock_qty",
            "stock_quantity",
            "inventory",
            "inventory_qty",
            "inventory_quantity",
        ],
        "store": [
            "store_id",
            "store",
            "warehouse",
            "warehouse_id",
        ],
        "reorder": [
            "reorder_level",
            "reorder_point",
            "reorder",
            "minimum_stock",
        ],
        "lead_time": [
            "lead_time",
            "lead_time_days",
        ],
    },

    "customers": {
        "customer": [
            "customer_id",
            "customerid",
            "customer",
            "user_id",
            "user",
        ],
        "name": [
            "name",
            "customer_name",
            "full_name",
        ],
        "location": [
            "location",
            "city",
            "state",
            "region",
            "address",
        ],
        "segment": [
            "segment",
            "customer_segment",
        ],
        "age": [
            "age",
        ],
        "email": [
            "email",
            "email_address",
        ],
    },

    "promotions": {
        "promotion": [
            "promotion_id",
            "promotion",
            "promo",
            "campaign",
            "campaign_id",
        ],
        "discount": [
            "discount",
            "discount_pct",
            "discount_percent",
            "discount_percentage",
        ],
        "start_date": [
            "start_date",
            "promotion_start",
            "campaign_start",
        ],
        "end_date": [
            "end_date",
            "promotion_end",
            "campaign_end",
        ],
        "product": [
            "product_id",
            "sku",
            "item_id",
            "product",
        ],
    },

    "stores": {
        "store": [
            "store_id",
            "storeid",
            "store",
            "store_name",
        ],
        "location": [
            "city",
            "state",
            "region",
            "location",
            "address",
        ],
    },
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def normalize_column(column):
    """
    Convert a source column name into a normalized representation.

    Examples:
        Product ID     -> product_id
        Selling-Price  -> selling_price
        STOCK QTY      -> stock_qty
    """
    value = str(column).strip().lower()

    # Handle camelCase / PascalCase.
    value = re.sub(
        r"(?<=[a-z0-9])(?=[A-Z])",
        "_",
        value,
    )

    # Replace spaces, hyphens and special characters with underscores.
    value = re.sub(
        r"[^a-z0-9]+",
        "_",
        value,
    )

    # Remove repeated underscores.
    value = re.sub(
        r"_+",
        "_",
        value,
    )

    return value.strip("_")


# ---------------------------------------------------------------------------
# Step 1: Automatic Column Mapping
# ---------------------------------------------------------------------------

CANONICAL_COLUMNS = [
    "product_id",
    "product_name",
    "category",
    "price",
    "cost",
    "stock_qty",
]


COLUMN_ALIASES = {
    "product_id": [
        "product_id",
        "product id",
        "productid",
        "sku",
        "sku_id",
        "item_id",
        "item code",
        "item_code",
        "product_code",
        "product code",
    ],

    "product_name": [
        "product_name",
        "product name",
        "productname",
        "name",
        "item_name",
        "item name",
        "product",
    ],

    "category": [
        "category",
        "product_category",
        "product category",
        "type",
        "department",
        "dept",
        "segment",
    ],

    "price": [
        "price",
        "selling_price",
        "selling price",
        "unit_price",
        "unit price",
        "sale_price",
        "sale price",
        "sellingprice",
    ],

    "cost": [
        "cost",
        "unit_cost",
        "unit cost",
        "cost_price",
        "cost price",
        "purchase_price",
        "purchase price",
    ],

    "stock_qty": [
        "stock_qty",
        "stock qty",
        "stock",
        "inventory",
        "inventory_qty",
        "inventory qty",
        "quantity",
        "qty",
        "stock_quantity",
        "stock quantity",
    ],
}


# Confidence thresholds.

CONFIDENCE_EXACT = 1.0

CONFIDENCE_ALIAS = 0.95

CONFIDENCE_NORMALIZED = 0.85

FUZZY_MIN_RATIO = 0.8

FUZZY_CONFIDENCE_FACTOR = 0.8

MAPPED_MIN_CONFIDENCE = 0.85


def _build_alias_lookup():
    """
    Build:

        normalized alias -> canonical column
    """

    lookup = {}

    for canonical, aliases in COLUMN_ALIASES.items():

        for alias in aliases:

            normalized_alias = normalize_column(alias)

            lookup[normalized_alias] = canonical

    return lookup


ALIAS_LOOKUP = _build_alias_lookup()


def match_canonical_column(column):
    """
    Match ONE client column to a canonical NexaRetail column.

    Returns:
        (canonical_name, confidence)

    or:

        None
    """

    raw = str(column)

    normalized = normalize_column(raw)

    # ---------------------------------------------------------
    # 1. Exact canonical match
    # ---------------------------------------------------------

    if raw in CANONICAL_COLUMNS:

        return raw, CONFIDENCE_EXACT

    # ---------------------------------------------------------
    # 2. Normalized canonical match
    # Example:
    # Product ID -> product_id
    # ---------------------------------------------------------

    if normalized in CANONICAL_COLUMNS:

        return normalized, CONFIDENCE_NORMALIZED

    # ---------------------------------------------------------
    # 3. Known alias match
    # ---------------------------------------------------------

    if normalized in ALIAS_LOOKUP:

        return (
            ALIAS_LOOKUP[normalized],
            CONFIDENCE_ALIAS,
        )

    # Nothing useful to compare.

    if not normalized:

        return None

    # ---------------------------------------------------------
    # 4. Fuzzy matching
    # ---------------------------------------------------------

    best_alias = None
    best_ratio = 0.0

    for alias in ALIAS_LOOKUP:

        ratio = difflib.SequenceMatcher(
            None,
            normalized,
            alias,
        ).ratio()

        if ratio > best_ratio:

            best_alias = alias
            best_ratio = ratio

    if best_ratio >= FUZZY_MIN_RATIO:

        confidence = round(
            best_ratio * FUZZY_CONFIDENCE_FACTOR,
            2,
        )

        return (
            ALIAS_LOOKUP[best_alias],
            confidence,
        )

    return None


def map_columns_to_canonical(columns):
    """
    Map client column names to the NexaRetail canonical schema.

    Important:
        - Does NOT rename the dataframe.
        - Does NOT invent missing columns.
        - Detects duplicate/conflicting mappings.
        - Returns confidence for each mapping.
    """

    candidates = {
        name: []
        for name in CANONICAL_COLUMNS
    }

    unmapped_columns = []

    # ---------------------------------------------------------
    # Analyze every source column.
    # ---------------------------------------------------------

    unique_columns = dict.fromkeys(
        str(column)
        for column in columns
    )

    for column in unique_columns:

        match = match_canonical_column(column)

        if match is None:

            unmapped_columns.append(column)

        else:

            canonical, score = match

            candidates[canonical].append(
                (column, score)
            )

    mapping = {}

    confidence = {}

    conflicts = {}

    missing_columns = []

    # ---------------------------------------------------------
    # Build final mapping.
    # ---------------------------------------------------------

    for canonical in CANONICAL_COLUMNS:

        found = candidates[canonical]

        # Required canonical field not found.
        if not found:

            missing_columns.append(canonical)

        # Exactly one possible source column.
        elif len(found) == 1:

            mapping[canonical] = found[0][0]

            confidence[canonical] = found[0][1]

        # Multiple source columns map to same canonical field.
        else:

            conflicts[canonical] = [
                column
                for column, _ in found
            ]

    # ---------------------------------------------------------
    # Determine mapping status.
    # ---------------------------------------------------------

    if missing_columns:

        status = "missing_required_columns"

    elif conflicts:

        status = "needs_review"

    elif any(
        score < MAPPED_MIN_CONFIDENCE
        for score in confidence.values()
    ):

        status = "needs_review"

    else:

        status = "mapped"

    return {
        "status": status,
        "mapping": mapping,
        "confidence": confidence,
        "missing_columns": missing_columns,
        "conflicts": conflicts,
        "unmapped_columns": unmapped_columns,
    }


# ---------------------------------------------------------------------------
# Dataset Detection
# ---------------------------------------------------------------------------

def detect_dataset_type(columns, df=None):
    """
    Detect probable dataset type using transparent weighted keyword scoring.
    """

    normalized_columns = [
        normalize_column(c)
        for c in columns
    ]

    scores = {}

    evidence = {}

    for dataset_type, groups in DATASET_SIGNATURES.items():

        score = 0

        reasons = []

        for field, aliases in groups.items():

            normalized_aliases = [
                normalize_column(alias)
                for alias in aliases
            ]

            matched = [
                column
                for column in normalized_columns
                if column in normalized_aliases
            ]

            if matched:

                # Important fields receive slightly higher weight.
                weight = (
                    2
                    if field in {
                        "date",
                        "product",
                        "quantity",
                        "stock",
                        "customer",
                        "promotion",
                        "store",
                    }
                    else 1
                )

                score += weight

                reasons.append(
                    f"{field} column detected: {matched[0]}"
                )

        scores[dataset_type] = score

        evidence[dataset_type] = reasons

    sorted_scores = sorted(
        scores.items(),
        key=lambda item: item[1],
        reverse=True,
    )

    top_type, top_score = sorted_scores[0]

    second_score = (
        sorted_scores[1][1]
        if len(sorted_scores) > 1
        else 0
    )

    total_possible = max(
        1,
        len(DATASET_SIGNATURES[top_type]) * 2,
    )

    confidence = min(
        1.0,
        top_score / total_possible,
    )

    # ---------------------------------------------------------
    # Determine dataset type.
    # ---------------------------------------------------------

    if top_score == 0:

        detected_type = "unknown"
        status = "unknown"

    elif top_score < 2:

        detected_type = "unknown"
        status = "unknown"

    elif top_score == second_score:

        detected_type = "unknown"
        status = "ambiguous"

    else:

        detected_type = top_type

        status = (
            "confident"
            if confidence >= 0.5
            else "review"
        )

    return {
        "type": detected_type,
        "confidence": round(
            confidence,
            2,
        ),
        "status": status,
        "scores": scores,
        "evidence": evidence.get(
            top_type,
            [],
        ),
    }


# ---------------------------------------------------------------------------
# File Reading
# ---------------------------------------------------------------------------

def read_uploaded_file(file_path, extension):
    """
    Read uploaded CSV/XLS/XLSX into a DataFrame.
    """

    if extension == ".csv":

        return pd.read_csv(
            file_path,
            dtype=str,
            keep_default_na=False,
        )

    if extension in {
        ".xlsx",
        ".xls",
    }:

        return pd.read_excel(
            file_path,
            dtype=str,
        )

    raise ValueError(
        "Unsupported file format."
    )


# ---------------------------------------------------------------------------
# Data Quality
# ---------------------------------------------------------------------------

def build_quality_hints(df):
    """
    Generate lightweight parse-level quality information.
    """

    duplicate_columns = [
        str(column)
        for column in df.columns
        if list(df.columns).count(column) > 1
    ]

    empty_columns = [
        str(column)
        for column in df.columns
        if df[column]
        .astype(str)
        .str.strip()
        .eq("")
        .all()
    ]

    return {
        "duplicate_columns": list(
            dict.fromkeys(
                duplicate_columns
            )
        ),

        "empty_columns": empty_columns,

        "preview_missing_values": int(
            df
            .replace("", pd.NA)
            .isna()
            .sum()
            .sum()
        ),
    }


# ---------------------------------------------------------------------------
# File Inspection
# ---------------------------------------------------------------------------

def inspect_file(file_path, original_filename):
    """
    Inspect an uploaded retail file.

    This function:
        1. Reads the file.
        2. Detects the dataset type.
        3. Detects canonical NexaRetail column mappings.
        4. Generates a preview.
        5. Generates basic quality information.
    """

    extension = Path(
        original_filename
    ).suffix.lower()

    df = read_uploaded_file(
        file_path,
        extension,
    )

    # ---------------------------------------------------------
    # Dataset detection.
    # ---------------------------------------------------------

    detection = detect_dataset_type(
        list(df.columns),
        df,
    )

    # ---------------------------------------------------------
    # Automatic canonical column mapping.
    # ---------------------------------------------------------

    column_mapping = map_columns_to_canonical(
        df.columns
    )

    # ---------------------------------------------------------
    # Preview.
    # ---------------------------------------------------------

    preview_df = df.head(
        PREVIEW_ROWS
    ).copy()

    # Convert everything to strings so JSON
    # serialization is predictable.

    preview_df = (
        preview_df
        .fillna("")
        .astype(str)
    )

    # ---------------------------------------------------------
    # Return complete inspection result.
    # ---------------------------------------------------------

    return {
        "filename": original_filename,

        "file_size_bytes": os.path.getsize(
            file_path
        ),

        "format": extension.lstrip("."),

        # Existing dataset detection.
        "detected_type": detection["type"],

        "confidence": detection["confidence"],

        "detection_status": detection["status"],

        "scores": detection["scores"],

        "evidence": detection["evidence"],

        # Original column names.
        "columns": [
            str(column)
            for column in df.columns
        ],

        # Normalized column names.
        "normalized_columns": [
            normalize_column(column)
            for column in df.columns
        ],

        # NEW:
        # Canonical NexaRetail mapping.
        "column_mapping": column_mapping,

        "row_count": len(df),

        "column_count": len(df.columns),

        "sample_data": preview_df.to_dict(
            orient="records"
        ),

        "quality_hints": build_quality_hints(
            preview_df
        ),
    }


# ---------------------------------------------------------------------------
# Save Uploaded File
# ---------------------------------------------------------------------------

def save_uploaded_file(file_storage):
    """
    Save a Flask uploaded file using a generated filename.

    Returns:
        saved path
        original filename
    """

    original_filename = (
        file_storage.filename or ""
    )

    if not original_filename:

        raise ValueError(
            "No filename provided."
        )

    extension = Path(
        original_filename
    ).suffix.lower()

    if extension not in {
        ".csv",
        ".xlsx",
        ".xls",
    }:

        raise ValueError(
            "Unsupported file type. "
            "Please upload CSV or Excel files."
        )

    safe_name = (
        f"{uuid.uuid4().hex}{extension}"
    )

    destination = (
        UPLOAD_DIR / safe_name
    )

    file_storage.save(
        destination
    )

    file_size = destination.stat().st_size

    if file_size == 0:

        destination.unlink(
            missing_ok=True
        )

        raise ValueError(
            "The uploaded file is empty."
        )

    if file_size > MAX_FILE_SIZE:

        destination.unlink(
            missing_ok=True
        )

        raise ValueError(
            "File is too large. "
            "Maximum supported size is 50 MB."
        )

    return (
        destination,
        original_filename,
    )
