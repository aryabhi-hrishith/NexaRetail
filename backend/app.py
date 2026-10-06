"""
NexaRetail -- Flask REST API
Wraps the existing ML pipeline modules and exposes JSON endpoints
for the React frontend.

Run with:
    python app.py

Endpoints:
    GET /api/overview
    GET /api/products
    GET /api/forecast
    GET /api/customers/segments
    GET /api/customers/preferences
    GET /api/promotions          ?segment=<int>  (optional)
    GET /api/sales/daily
    GET /health
"""

import os
import sys
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS

# ---------------------------------------------------------------------------
# Make sure src/ Python modules are importable
# ---------------------------------------------------------------------------
sys.path.insert(0, str(Path(__file__).parent))

from src.data_prep import load_data, validate_data
from src.forecasting import train_models, forecast_7_days
from src.personalization import (
    build_customer_features,
    segment_customers,
    segment_preferences,
)
from src.inventory import build_inventory_report
from src.promotion_engine import generate_promotion_plan

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ---------------------------------------------------------------------------
# Data directory -- override with DATA_DIR env var if needed
# ---------------------------------------------------------------------------
DATA_DIR = os.environ.get("DATA_DIR", str(Path(__file__).parent / "data"))

# ---------------------------------------------------------------------------
# Startup: load data and run the full ML pipeline once, then cache results
# ---------------------------------------------------------------------------
_cache = {}


def get_analytics():
    """Load data and run the full pipeline. Results are cached in memory."""
    if _cache:
        return _cache

    print("Loading data from:", DATA_DIR)
    data = load_data(DATA_DIR)
    validate_data(data)

    print("Training forecasting models...")
    models = train_models(data["sales"])
    forecast = forecast_7_days(data["sales"], models)

    print("Building customer features and segments...")
    customer_features = build_customer_features(
        data["customers"], data["purchases"], data["products"]
    )
    customer_segments, _, _ = segment_customers(customer_features)
    preferences = segment_preferences(
        customer_segments, data["purchases"], data["products"]
    )

    print("Building inventory report...")
    inventory = build_inventory_report(data["products"], forecast)

    print("Generating promotion plan...")
    promotions = generate_promotion_plan(inventory, preferences)

    _cache["data"] = data
    _cache["forecast"] = forecast
    _cache["customer_segments"] = customer_segments
    _cache["preferences"] = preferences
    _cache["inventory"] = inventory
    _cache["promotions"] = promotions

    print("Pipeline ready.")
    return _cache


# ---------------------------------------------------------------------------
# Helper: safely convert NaN / numpy scalars to plain Python types
# ---------------------------------------------------------------------------
def _to_records(df):
    """Convert a DataFrame to a JSON-safe list of dicts."""
    return df.where(df.notna(), None).to_dict(orient="records")


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.route("/health")
def health():
    return jsonify({"status": "ok"})


# ---------------------------------------------------------------------------
# GET /api/overview
# ---------------------------------------------------------------------------
@app.route("/api/overview")
def overview():
    c = get_analytics()
    data = c["data"]
    inventory = c["inventory"]
    forecast = c["forecast"]

    total_stock = int(data["products"]["stock_qty"].sum())
    total_forecast = float(round(forecast["forecast_7d"].sum(), 1))
    high_risk_count = int((inventory["stock_risk"] == "High").sum())
    medium_risk_count = int((inventory["stock_risk"] == "Medium").sum())
    low_risk_count = int((inventory["stock_risk"] == "Low").sum())

    return jsonify(
        {
            "products": len(data["products"]),
            "customers": len(data["customers"]),
            "total_stock_qty": total_stock,
            "forecast_7d_total": total_forecast,
            "high_risk_products": high_risk_count,
            "medium_risk_products": medium_risk_count,
            "low_risk_products": low_risk_count,
            "categories": sorted(data["products"]["category"].unique().tolist()),
        }
    )


# ---------------------------------------------------------------------------
# GET /api/products
# ---------------------------------------------------------------------------
@app.route("/api/products")
def products():
    c = get_analytics()
    inventory = c["inventory"]

    cols = [
        "product_id",
        "product_name",
        "category",
        "price",
        "cost",
        "stock_qty",
        "forecast_7d",
        "expected_remaining",
        "stock_coverage_ratio",
        "stock_risk",
        "margin",
        "margin_pct",
    ]
    cols = [col for col in cols if col in inventory.columns]
    display = inventory[cols].copy()
    display["stock_coverage_ratio"] = display["stock_coverage_ratio"].round(2)
    display["margin_pct"] = display["margin_pct"].round(4)

    return jsonify(_to_records(display))


# ---------------------------------------------------------------------------
# GET /api/forecast
# ---------------------------------------------------------------------------
@app.route("/api/forecast")
def forecast_endpoint():
    c = get_analytics()
    forecast = c["forecast"]
    data = c["data"]

    merged = forecast.merge(
        data["products"][["product_id", "product_name", "category"]],
        on="product_id",
        how="left",
    ).sort_values("forecast_7d", ascending=False)

    return jsonify(_to_records(merged))


# ---------------------------------------------------------------------------
# GET /api/customers/segments
# ---------------------------------------------------------------------------
@app.route("/api/customers/segments")
def customer_segments_endpoint():
    c = get_analytics()
    segments = c["customer_segments"]

    summary = (
        segments.groupby("segment")
        .agg(
            customers=("customer_id", "count"),
            total_spend=("total_spend", "sum"),
            avg_spend=("total_spend", "mean"),
            avg_units=("total_units", "mean"),
            avg_unique_products=("unique_products", "mean"),
        )
        .reset_index()
    )
    summary["total_spend"] = summary["total_spend"].round(2)
    summary["avg_spend"] = summary["avg_spend"].round(2)
    summary["avg_units"] = summary["avg_units"].round(1)
    summary["avg_unique_products"] = summary["avg_unique_products"].round(1)

    detail_cols = [
        "customer_id", "region", "age",
        "total_spend", "total_units", "unique_products",
        "preferred_category", "segment",
    ]
    detail_cols = [col for col in detail_cols if col in segments.columns]
    detail = segments[detail_cols].copy()

    return jsonify({"summary": _to_records(summary), "detail": _to_records(detail)})


# ---------------------------------------------------------------------------
# GET /api/customers/preferences
# ---------------------------------------------------------------------------
@app.route("/api/customers/preferences")
def customer_preferences_endpoint():
    c = get_analytics()
    return jsonify(_to_records(c["preferences"]))


# ---------------------------------------------------------------------------
# GET /api/promotions   ?segment=<int>
# ---------------------------------------------------------------------------
@app.route("/api/promotions")
def promotions_endpoint():
    c = get_analytics()
    promotions = c["promotions"].copy()

    segment_param = request.args.get("segment")
    if segment_param is not None:
        try:
            seg = int(segment_param)
            promotions = promotions[promotions["customer_segment"] == seg]
        except ValueError:
            return jsonify({"error": "segment must be an integer"}), 400

    return jsonify(_to_records(promotions))


# ---------------------------------------------------------------------------
# GET /api/sales/daily
# ---------------------------------------------------------------------------
@app.route("/api/sales/daily")
def sales_daily():
    c = get_analytics()
    daily = (
        c["data"]["sales"]
        .groupby("date", as_index=False)["quantity_sold"]
        .sum()
        .sort_values("date")
    )
    daily["date"] = daily["date"].dt.strftime("%Y-%m-%d")
    return jsonify(_to_records(daily))


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"NexaRetail API starting on http://localhost:{port}")
    get_analytics()
    app.run(host="0.0.0.0", port=port, debug=False)
