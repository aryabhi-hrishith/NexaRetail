from pathlib import Path
import pandas as pd


REQUIRED_COLUMNS = {

    "products": [
        "product_id",
        "product_name",
        "category",
        "price",
        "cost",
        "stock_qty"
    ],

    "customers": [
        "customer_id",
        "region",
        "age"
    ],

    "sales": [
        "date",
        "product_id",
        "quantity_sold",
        "promotion_applied"
    ],

    "purchases": [
        "customer_id",
        "product_id",
        "quantity_purchased"
    ]
}


def load_data(data_dir="data"):

    data_dir = Path(data_dir)

    data = {

        "products":
            pd.read_csv(
                data_dir / "products.csv"
            ),

        "customers":
            pd.read_csv(
                data_dir / "customers.csv"
            ),

        "sales":
            pd.read_csv(
                data_dir / "sales.csv"
            ),

        "purchases":
            pd.read_csv(
                data_dir / "purchases.csv"
            )
    }

    data["sales"]["date"] = pd.to_datetime(
        data["sales"]["date"]
    )

    return data


def validate_data(data):

    errors = []

    for name, columns in REQUIRED_COLUMNS.items():

        missing_columns = [
            column
            for column in columns
            if column not in data[name].columns
        ]

        if missing_columns:

            errors.append(
                f"{name}: missing columns "
                f"{missing_columns}"
            )

    if errors:

        raise ValueError(
            "Data validation failed: "
            + "; ".join(errors)
        )

    return True