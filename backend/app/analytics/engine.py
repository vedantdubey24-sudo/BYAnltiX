
import pandas as pd


def generate_analytics(df: pd.DataFrame):

    analytics = {
        "dataset_summary": {},
        "numeric_analysis": {},
        "categorical_analysis": {},
        "date_analysis": {}
    }

    # 1. Dataset summary
    analytics["dataset_summary"] = {
        "total_records": int(df.shape[0]),
        "total_columns": int(df.shape[1]),
        "numeric_columns": [],
        "categorical_columns": [],
        "date_columns": [],
        "text_columns": []
    }

    # 2. Identify column types
    for column in df.columns:

        series = df[column]

        if pd.api.types.is_bool_dtype(series):
            analytics["categorical_analysis"][str(column)] = {
                "unique_values": int(series.nunique()),
                "value_distribution": {
                    str(key): int(value)
                    for key, value in series.value_counts().items()
                }
            }

            analytics["dataset_summary"]["categorical_columns"].append(
                str(column)
            )

        elif pd.api.types.is_numeric_dtype(series):

            analytics["dataset_summary"]["numeric_columns"].append(
                str(column)
            )

            valid_data = series.dropna()

            analytics["numeric_analysis"][str(column)] = {
                "count": int(valid_data.count()),
                "sum": round(float(valid_data.sum()), 2),
                "average": (
                    round(float(valid_data.mean()), 2)
                    if not valid_data.empty else None
                ),
                "minimum": (
                    float(valid_data.min())
                    if not valid_data.empty else None
                ),
                "maximum": (
                    float(valid_data.max())
                    if not valid_data.empty else None
                ),
                "median": (
                    round(float(valid_data.median()), 2)
                    if not valid_data.empty else None
                ),
                "standard_deviation": (
                    round(float(valid_data.std()), 2)
                    if len(valid_data) >= 2 else None
                )
            }

        else:

            # Detect date columns
            converted_dates = pd.to_datetime(
                series,
                errors="coerce",
                format="mixed"
            )

            valid_dates = converted_dates.dropna()

            date_percentage = (
                len(valid_dates) / max(series.notna().sum(), 1)
            ) * 100

            if len(valid_dates) > 0 and date_percentage >= 90:

                analytics["dataset_summary"]["date_columns"].append(
                    str(column)
                )

                analytics["date_analysis"][str(column)] = {
                    "earliest_date": str(valid_dates.min()),
                    "latest_date": str(valid_dates.max()),
                    "date_range_days": int(
                        (valid_dates.max() - valid_dates.min()).days
                    )
                }

            else:

                unique_count = series.nunique()
                non_null_count = max(series.notna().sum(), 1)

                unique_ratio = unique_count / non_null_count

                if unique_count <= 20 or unique_ratio <= 0.05:

                    analytics["dataset_summary"]["categorical_columns"].append(
                        str(column)
                    )

                    analytics["categorical_analysis"][str(column)] = {
                        "unique_values": int(unique_count),
                        "value_distribution": {
                            str(key): int(value)
                            for key, value in series.value_counts().head(20).items()
                        }
                    }

                else:

                    analytics["dataset_summary"]["text_columns"].append(
                        str(column)
                    )

    return analytics
