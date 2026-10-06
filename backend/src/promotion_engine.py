import numpy as np
import pandas as pd


def generate_promotion_plan(
    inventory_report,
    segment_preferences
):

    results = []

    categories_by_segment = (
        segment_preferences
        .groupby("segment")["category"]
        .apply(list)
        .to_dict()
    )

    for _, product in inventory_report.iterrows():

        relevant_segments = []

        for (
            segment,
            categories
        ) in categories_by_segment.items():

            if product["category"] in categories:

                relevant_segments.append(
                    int(segment)
                )

        if not relevant_segments:

            relevant_segments = [0]

        # -----------------------
        # PROMOTION DECISION
        # -----------------------

        if product["stock_risk"] == "High":

            recommendation = (
                "Do not promote - "
                "replenish first"
            )

            discount = 0

        elif product["margin_pct"] < 0.15:

            recommendation = (
                "Avoid deep discount"
            )

            discount = 5

        elif (
            product["forecast_7d"]
            > product["stock_qty"] * 0.0
            and
            product["stock_qty"]
            > product["forecast_7d"] * 1.5
        ):

            recommendation = "Promote"

            discount = 10

        else:

            recommendation = (
                "Targeted promotion"
            )

            discount = 5

        # -----------------------
        # SCORE
        # -----------------------

        stock_score = min(
            float(
                product[
                    "stock_coverage_ratio"
                ]
            ) / 2.0,
            1.0
        )

        margin_score = min(
            float(
                product[
                    "margin_pct"
                ]
            ) / 0.4,
            1.0
        )

        demand_score = min(
            float(
                product[
                    "forecast_7d"
                ]
            ) / 100.0,
            1.0
        )

        score = (
            0.35 * stock_score
            +
            0.35 * margin_score
            +
            0.30 * demand_score
        )

        for segment in relevant_segments[:2]:

            results.append({

                "product_id":
                    product["product_id"],

                "product_name":
                    product["product_name"],

                "category":
                    product["category"],

                "customer_segment":
                    segment,

                "forecast_7d":
                    round(
                        float(
                            product[
                                "forecast_7d"
                            ]
                        ),
                        1
                    ),

                "stock_qty":
                    int(
                        product[
                            "stock_qty"
                        ]
                    ),

                "stock_risk":
                    product[
                        "stock_risk"
                    ],

                "margin_pct":
                    round(
                        float(
                            product[
                                "margin_pct"
                            ] * 100
                        ),
                        1
                    ),

                "suggested_discount_pct":
                    discount,

                "promotion_score":
                    round(
                        float(
                            np.clip(
                                score,
                                0,
                                1
                            ) * 100
                        ),
                        1
                    ),

                "recommendation":
                    recommendation,

                "explanation":
                    (
                        f"Category relevance "
                        f"with segment {segment}; "
                        f"7-day demand forecast "
                        f"is "
                        f"{product['forecast_7d']:.0f} "
                        f"units; stock risk is "
                        f"{product['stock_risk']}."
                    )
            })

    return (
        pd.DataFrame(results)
        .sort_values(
            [
                "promotion_score",
                "forecast_7d"
            ],
            ascending=False
        )
        .reset_index(drop=True)
    )