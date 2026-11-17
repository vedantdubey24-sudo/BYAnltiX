

import pandas as pd


def generate_visualizations(df: pd.DataFrame):

    visualizations = {
        "bar_charts": [],
        "pie_charts": [],
        "histograms": [],
        "line_charts": []
    }

    # Identify numeric and categorical columns
    numeric_columns = df.select_dtypes(include="number").columns.tolist()

    categorical_columns = []
    date_columns = []

    for column in df.columns:

        series = df[column]

        if pd.api.types.is_bool_dtype(series):
            categorical_columns.append(column)
            continue

        if pd.api.types.is_numeric_dtype(series):
            continue

        dates = pd.to_datetime(
            series,
            errors="coerce",
            format="mixed"
        )

        valid_dates = dates.notna().sum()
        total_values = series.notna().sum()

        date_percentage = (
            valid_dates / total_values * 100
            if total_values > 0 else 0
        )

        if valid_dates > 0 and date_percentage >= 90:
            date_columns.append(column)

        elif series.nunique() <= 20 or (
            series.nunique() / max(total_values, 1)
        ) <= 0.05:
            categorical_columns.append(column)

    # 1. Generate bar charts
    for column in categorical_columns[:5]:

        distribution = (
            df[column]
            .value_counts()
            .head(10)
        )

        visualizations["bar_charts"].append({
            "title": f"Distribution of {column}",
            "category_column": str(column),
            "labels": [str(value) for value in distribution.index],
            "values": [int(value) for value in distribution.values]
        })

    # 2. Generate pie charts
    for column in categorical_columns[:3]:

        distribution = (
            df[column]
            .value_counts()
            .head(8)
        )

        visualizations["pie_charts"].append({
            "title": f"Proportion of {column}",
            "category_column": str(column),
            "labels": [str(value) for value in distribution.index],
            "values": [int(value) for value in distribution.values]
        })

    # 3. Generate histograms
    for column in numeric_columns[:6]:

        values = df[column].dropna()

        if values.empty:
            continue

        counts, bin_edges = pd.cut(
            values,
            bins=10,
            include_lowest=True,
            retbins=True
        )

        distribution = counts.value_counts(sort=False)

        visualizations["histograms"].append({
            "title": f"Distribution of {column}",
            "numeric_column": str(column),
            "labels": [
                str(interval)
                for interval in distribution.index
            ],
            "values": [
                int(value)
                for value in distribution.values
            ]
        })

    # 4. Generate date-based line charts
    for date_column in date_columns[:3]:

        dates = pd.to_datetime(
            df[date_column],
            errors="coerce",
            format="mixed"
        )

        for numeric_column in numeric_columns[:3]:

            trend_data = pd.DataFrame({
                "date": dates,
                "value": df[numeric_column]
            }).dropna()

            if trend_data.empty:
                continue

            trend_data["month"] = (
                trend_data["date"].dt.to_period("M").astype(str)
            )

            monthly_data = (
                trend_data.groupby("month")["value"]
                .sum()
                .sort_index()
            )

            visualizations["line_charts"].append({
                "title": f"{numeric_column} Trend Over Time",
                "date_column": str(date_column),
                "numeric_column": str(numeric_column),
                "labels": [
                    str(value) for value in monthly_data.index
                ],
                "values": [
                    round(float(value), 2)
                    for value in monthly_data.values
                ]
            })

    return visualizations
