import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestRegressor


FEATURES = [
    "day_of_week",
    "day_of_month",
    "month",
    "day_index"
]


def make_training_table(sales):

    df = sales.copy()

    df = df.sort_values(
        ["product_id", "date"]
    )

    df["day_of_week"] = (
        df["date"].dt.dayofweek
    )

    df["day_of_month"] = (
        df["date"].dt.day
    )

    df["month"] = (
        df["date"].dt.month
    )

    df["day_index"] = (
        df.groupby("product_id")
        .cumcount()
    )

    return df


def train_models(sales):

    df = make_training_table(
        sales
    )

    models = {}

    for product_id, group in df.groupby(
        "product_id"
    ):

        model = RandomForestRegressor(
            n_estimators=120,
            random_state=42,
            min_samples_leaf=2,
            n_jobs=-1
        )

        model.fit(
            group[FEATURES],
            group["quantity_sold"]
        )

        models[product_id] = model

    return models


def forecast_7_days(
    sales,
    models
):

    df = make_training_table(
        sales
    )

    last_date = df["date"].max()

    results = []

    for product_id, group in df.groupby(
        "product_id"
    ):

        model = models[product_id]

        last_index = int(
            group["day_index"].max()
        )

        future_dates = pd.date_range(
            last_date + pd.Timedelta(days=1),
            periods=7
        )

        future = pd.DataFrame({

            "date":
                future_dates,

            "day_of_week":
                future_dates.dayofweek,

            "day_of_month":
                future_dates.day,

            "month":
                future_dates.month,

            "day_index":
                np.arange(
                    last_index + 1,
                    last_index + 8
                )
        })

        predictions = model.predict(
            future[FEATURES]
        )

        predictions = np.maximum(
            predictions,
            0
        )

        results.append({

            "product_id":
                product_id,

            "forecast_7d":
                round(
                    float(
                        predictions.sum()
                    ),
                    1
                )
        })

    return pd.DataFrame(
        results
    )