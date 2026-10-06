import pandas as pd


def build_inventory_report(
    products,
    forecast
):

    report = products.merge(
        forecast,
        on="product_id",
        how="left"
    )

    report["expected_remaining"] = (
        report["stock_qty"]
        - report["forecast_7d"]
    )

    report["stock_coverage_ratio"] = (
        report["stock_qty"]
        /
        report["forecast_7d"].replace(
            0,
            0.1
        )
    )

    report["stock_risk"] = "Low"

    report.loc[
        report["stock_coverage_ratio"] < 1.0,
        "stock_risk"
    ] = "High"

    report.loc[
        (
            report["stock_coverage_ratio"] >= 1.0
        )
        &
        (
            report["stock_coverage_ratio"] < 1.5
        ),
        "stock_risk"
    ] = "Medium"

    report["margin"] = (
        report["price"]
        - report["cost"]
    )

    report["margin_pct"] = (
        report["margin"]
        /
        report["price"].replace(
            0,
            0.1
        )
    )

    return report