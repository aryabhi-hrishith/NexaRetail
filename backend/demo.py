from src.data_prep import (
    load_data,
    validate_data
)

from src.forecasting import (
    train_models,
    forecast_7_days
)

from src.personalization import (
    build_customer_features,
    segment_customers,
    segment_preferences
)

from src.inventory import (
    build_inventory_report
)

from src.promotion_engine import (
    generate_promotion_plan
)


# Load data
data = load_data("data")

validate_data(data)


# Demand forecasting
models = train_models(
    data["sales"]
)

forecast = forecast_7_days(
    data["sales"],
    models
)


# Customer AI
customer_features = (
    build_customer_features(
        data["customers"],
        data["purchases"],
        data["products"]
    )
)

(
    customer_segments,
    _,
    _
) = segment_customers(
    customer_features
)

preferences = (
    segment_preferences(
        customer_segments,
        data["purchases"],
        data["products"]
    )
)


# Inventory
inventory = (
    build_inventory_report(
        data["products"],
        forecast
    )
)


# Promotion engine
promotions = (
    generate_promotion_plan(
        inventory,
        preferences
    )
)


# OUTPUT
print()
print(
    "=== AI RETAIL PLANNER DEMO ==="
)

print(
    f"Products: "
    f"{len(data['products'])}"
)

print(
    f"Customers: "
    f"{len(data['customers'])}"
)

print(
    f"Sales rows: "
    f"{len(data['sales'])}"
)

print(
    "Total 7-day forecast: "
    f"{forecast['forecast_7d'].sum():.0f} units"
)

print(
    "High stock-risk products: "
    f"{(inventory['stock_risk'] == 'High').sum()}"
)

print()
print(
    "=== TOP PROMOTION "
    "RECOMMENDATIONS ==="
)

print(
    promotions[
        [
            "product_name",
            "customer_segment",
            "forecast_7d",
            "stock_qty",
            "suggested_discount_pct",
            "promotion_score",
            "recommendation"
        ]
    ]
    .head(10)
    .to_string(index=False)
)