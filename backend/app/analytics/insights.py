
import pandas as pd


def generate_insights(df: pd.DataFrame):

    insights = []

    total_rows = len(df)

    if total_rows == 0:
        return ["The uploaded dataset contains no records."]

    # 1. Dataset size insight
    insights.append(
        f"The dataset contains {total_rows:,} records "
        f"across {len(df.columns)} columns."
    )

    # 2. Missing value insight
    missing_count = int(df.isna().sum().sum())

    if missing_count == 0:
        insights.append(
            "The dataset has no missing values."
        )
    else:
        missing_percentage = round(
            (missing_count / (df.shape[0] * df.shape[1])) * 100, 2
        )

        insights.append(
            f"The dataset contains {missing_count:,} missing values "
            f"({missing_percentage}% of all cells)."
        )

    # 3. Duplicate records insight
    duplicate_count = int(df.duplicated().sum())

    if duplicate_count == 0:
        insights.append(
            "No duplicate records were found."
        )
    else:
        insights.append(
            f"The dataset contains {duplicate_count:,} duplicate records."
        )

    # 4. Numeric column insights
    numeric_columns = df.select_dtypes(include="number").columns

    for column in numeric_columns[:5]:

        values = df[column].dropna()

        if values.empty:
            continue

        average = float(values.mean())
        maximum = float(values.max())
        minimum = float(values.min())

        insights.append(
            f"{column}: average is {average:.2f}, "
            f"maximum is {maximum:.2f}, "
            f"and minimum is {minimum:.2f}."
        )

    # 5. Categorical column insights
    categorical_count = 0

    for column in df.columns:

        series = df[column]

        if (
            pd.api.types.is_numeric_dtype(series)
            or pd.api.types.is_bool_dtype(series)
        ):
            continue

        if series.nunique() > 20 or series.nunique() == 0:
            continue

        distribution = series.value_counts()

        if distribution.empty:
            continue

        highest_category = distribution.index[0]
        highest_count = int(distribution.iloc[0])

        percentage = round(
            (highest_count / total_rows) * 100, 2
        )

        insights.append(
            f"{highest_category} is the most frequent value "
            f"in {column}, appearing {highest_count:,} times "
            f"({percentage}% of records)."
        )

        categorical_count += 1

        if categorical_count >= 5:
            break

    # 6. Negative numeric values
    for column in numeric_columns:

        negative_count = int((df[column] < 0).sum())

        if negative_count > 0:
            insights.append(
                f"{column} contains {negative_count:,} negative values. "
                "Review these records if negative values are unexpected."
            )

    return insights
