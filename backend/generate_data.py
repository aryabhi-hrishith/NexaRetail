from pathlib import Path
import numpy as np
import pandas as pd

SEED = 42
rng = np.random.default_rng(SEED)

DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

# -----------------------------
# PRODUCTS
# -----------------------------

categories = [
    "Snacks",
    "Beverages",
    "Breakfast",
    "Dairy",
    "Personal Care",
    "Household"
]

products = []

for i in range(1, 31):
    category = categories[(i - 1) % len(categories)]

    price = round(float(rng.uniform(30, 450)), 2)
    cost = round(price * float(rng.uniform(0.55, 0.78)), 2)
    stock = int(rng.integers(40, 700))

    products.append([
        f"P{i:03d}",
        f"{category} Product {i}",
        category,
        price,
        cost,
        stock
    ])

products_df = pd.DataFrame(
    products,
    columns=[
        "product_id",
        "product_name",
        "category",
        "price",
        "cost",
        "stock_qty"
    ]
)

# -----------------------------
# CUSTOMERS
# -----------------------------

customers = []

for i in range(1, 121):
    customers.append([
        f"C{i:03d}",
        rng.choice(["North", "South", "East", "West"]),
        int(rng.integers(18, 66))
    ])

customers_df = pd.DataFrame(
    customers,
    columns=[
        "customer_id",
        "region",
        "age"
    ]
)

# -----------------------------
# SALES
# -----------------------------

dates = pd.date_range(
    "2025-01-01",
    periods=180,
    freq="D"
)

sales = []

for _, product in products_df.iterrows():

    base_demand = float(rng.uniform(4, 35))
    trend = float(rng.uniform(-0.01, 0.03))

    for day_index, date in enumerate(dates):

        weekend_factor = (
            1.20 if date.dayofweek >= 5 else 1.0
        )

        seasonal_factor = (
            1.0 +
            0.15 * np.sin(2 * np.pi * day_index / 30)
        )

        promotion = int(rng.random() < 0.12)

        promotion_factor = (
            1.20 if promotion else 1.0
        )

        expected_demand = max(
            1,
            base_demand
            * (1 + trend * day_index)
            * weekend_factor
            * seasonal_factor
            * promotion_factor
        )

        quantity = int(
            rng.poisson(expected_demand)
        )

        sales.append([
            date,
            product["product_id"],
            quantity,
            promotion
        ])

sales_df = pd.DataFrame(
    sales,
    columns=[
        "date",
        "product_id",
        "quantity_sold",
        "promotion_applied"
    ]
)

# -----------------------------
# CUSTOMER PURCHASES
# -----------------------------

purchases = []

for customer_id in customers_df["customer_id"]:

    selected_products = rng.choice(
        products_df["product_id"],
        size=int(rng.integers(3, 10)),
        replace=False
    )

    for product_id in selected_products:

        quantity = int(
            rng.integers(1, 8)
        )

        purchases.append([
            customer_id,
            product_id,
            quantity
        ])

purchases_df = pd.DataFrame(
    purchases,
    columns=[
        "customer_id",
        "product_id",
        "quantity_purchased"
    ]
)

# -----------------------------
# SAVE DATA
# -----------------------------

products_df.to_csv(
    DATA_DIR / "products.csv",
    index=False
)

customers_df.to_csv(
    DATA_DIR / "customers.csv",
    index=False
)

sales_df.to_csv(
    DATA_DIR / "sales.csv",
    index=False
)

purchases_df.to_csv(
    DATA_DIR / "purchases.csv",
    index=False
)

print("Synthetic data generated successfully.")
print(f"Products: {len(products_df):,}")
print(f"Customers: {len(customers_df):,}")
print(f"Sales rows: {len(sales_df):,}")
print(f"Purchase rows: {len(purchases_df):,}")