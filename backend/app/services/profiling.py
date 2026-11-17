
import pandas as pd


def detect_column_type(series: pd.Series):
    """
    Automatically identifies whether a column contains
    numeric, boolean, date, categorical, text, or empty data.
    """

    # Check for empty columns
    non_null = series.dropna()

    if len(non_null) == 0:
        return "empty"

    # Check boolean columns
    if pd.api.types.is_bool_dtype(series):
        return "boolean"

    # Check numeric columns
    if pd.api.types.is_numeric_dtype(series):
        return "numeric"

    # Check date columns
    try:
        converted_dates = pd.to_datetime(
            non_null,
            errors="coerce",
            format="mixed"
        )

        date_percentage = converted_dates.notna().mean() * 100

        if date_percentage >= 90:
            return "date"

    except Exception:
        pass

    # Check categorical and text columns
    unique_count = series.nunique()
    unique_ratio = unique_count / len(non_null)

    if unique_count <= 20 or unique_ratio <= 0.05:
        return "categorical"

    return "text"


def generate_profile(df: pd.DataFrame):

    profile = {
        "total_rows": int(df.shape[0]),
        "total_columns": int(df.shape[1]),
        "duplicate_rows": int(df.duplicated().sum()),
        "columns": {}
    }

    for column in df.columns:

        series = df[column]

        detected_type = detect_column_type(series)

        column_profile = {
            "data_type": str(series.dtype),
            "detected_type": detected_type,
            "missing_values": int(series.isna().sum()),
            "missing_percentage": round(
                float(series.isna().mean() * 100), 2
            ),
            "unique_values": int(series.nunique())
        }

        # Numeric column statistics
        if detected_type == "numeric":

            column_profile["statistics"] = {
                "mean": (
                    None if series.count() == 0
                    else round(float(series.mean()), 2)
                ),
                "median": (
                    None if series.count() == 0
                    else round(float(series.median()), 2)
                ),
                "minimum": (
                    None if series.count() == 0
                    else float(series.min())
                ),
                "maximum": (
                    None if series.count() == 0
                    else float(series.max())
                ),
                "standard_deviation": (
                    None if series.count() < 2
                    else round(float(series.std()), 2)
                )
            }

        # Date column information
        elif detected_type == "date":

            dates = pd.to_datetime(
                series,
                errors="coerce",
                format="mixed"
            )

            valid_dates = dates.dropna()

            column_profile["date_statistics"] = {
                "earliest_date": (
                    str(valid_dates.min())
                    if not valid_dates.empty else None
                ),
                "latest_date": (
                    str(valid_dates.max())
                    if not valid_dates.empty else None
                )
            }

        # Text, categorical, boolean and empty column information
        else:

            column_profile["top_values"] = {
                str(key): int(value)
                for key, value in series.value_counts().head(5).items()
            }

        profile["columns"][str(column)] = column_profile

    return profile
