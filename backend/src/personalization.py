import pandas as pd

from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler


def build_customer_features(
    customers,
    purchases,
    products
):

    merged = purchases.merge(
        products[
            [
                "product_id",
                "category",
                "price"
            ]
        ],
        on="product_id",
        how="left"
    )

    merged["spend"] = (
        merged["quantity_purchased"]
        * merged["price"]
    )

    spending = (
        merged
        .groupby("customer_id")
        .agg(
            total_spend=("spend", "sum"),
            total_units=(
                "quantity_purchased",
                "sum"
            ),
            unique_products=(
                "product_id",
                "nunique"
            )
        )
        .reset_index()
    )

    category_counts = (
        merged
        .groupby(
            [
                "customer_id",
                "category"
            ]
        )["quantity_purchased"]
        .sum()
        .reset_index()
    )

    preferred = (
        category_counts
        .sort_values(
            [
                "customer_id",
                "quantity_purchased"
            ],
            ascending=[True, False]
        )
        .drop_duplicates(
            "customer_id"
        )
        .rename(
            columns={
                "category":
                    "preferred_category"
            }
        )
        [
            [
                "customer_id",
                "preferred_category"
            ]
        ]
    )

    features = customers.merge(
        spending,
        on="customer_id",
        how="left"
    )

    features = features.merge(
        preferred,
        on="customer_id",
        how="left"
    )

    numeric_columns = [
        "total_spend",
        "total_units",
        "unique_products"
    ]

    features[numeric_columns] = (
        features[numeric_columns]
        .fillna(0)
    )

    features["preferred_category"] = (
        features[
            "preferred_category"
        ].fillna("Unknown")
    )

    return features


def segment_customers(
    features,
    n_clusters=4
):

    numeric_columns = [
        "total_spend",
        "total_units",
        "unique_products",
        "age"
    ]

    scaler = StandardScaler()

    X = scaler.fit_transform(
        features[numeric_columns]
    )

    model = KMeans(
        n_clusters=n_clusters,
        random_state=42,
        n_init=10
    )

    result = features.copy()

    result["segment"] = (
        model.fit_predict(X)
    )

    return (
        result,
        model,
        scaler
    )


def segment_preferences(
    customer_segments,
    purchases,
    products
):

    merged = purchases.merge(
        products[
            [
                "product_id",
                "category"
            ]
        ],
        on="product_id",
        how="left"
    )

    merged = merged.merge(
        customer_segments[
            [
                "customer_id",
                "segment"
            ]
        ],
        on="customer_id",
        how="left"
    )

    preferences = (
        merged
        .groupby(
            [
                "segment",
                "category"
            ]
        )["quantity_purchased"]
        .sum()
        .reset_index()
        .sort_values(
            [
                "segment",
                "quantity_purchased"
            ],
            ascending=[True, False]
        )
    )

    return preferences