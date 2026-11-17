
import pandas as pd


def analyze_data_quality(df: pd.DataFrame):

    total_rows, total_columns = df.shape
    total_cells = total_rows * total_columns

    # Missing value analysis
    missing_cells = int(df.isna().sum().sum())

    missing_percentage = (
        round((missing_cells / total_cells) * 100, 2)
        if total_cells > 0 else 0
    )

    # Duplicate record analysis
    duplicate_rows = int(df.duplicated().sum())

    duplicate_percentage = (
        round((duplicate_rows / total_rows) * 100, 2)
        if total_rows > 0 else 0
    )

    # Identify problematic columns
    columns_with_missing_values = []
    empty_columns = []
    constant_columns = []

    for column in df.columns:

        series = df[column]

        if series.isna().any():
            columns_with_missing_values.append(str(column))

        if series.isna().all():
            empty_columns.append(str(column))

        if series.nunique(dropna=False) <= 1:
            constant_columns.append(str(column))

    # Generate recommendations
    recommendations = []

    if missing_cells > 0:
        recommendations.append(
            "Review missing values and decide whether to fill or remove them."
        )

    if duplicate_rows > 0:
        recommendations.append(
            "Review duplicate records before performing analysis."
        )

    if empty_columns:
        recommendations.append(
            "Remove or investigate completely empty columns."
        )

    if constant_columns:
        recommendations.append(
            "Review columns containing only one distinct value."
        )

    if not recommendations:
        recommendations.append(
            "No basic data quality issues detected."
        )

    return {
        "total_cells": int(total_cells),
        "missing_cells": missing_cells,
        "missing_percentage": missing_percentage,
        "duplicate_rows": duplicate_rows,
        "duplicate_percentage": duplicate_percentage,
        "columns_with_missing_values": columns_with_missing_values,
        "empty_columns": empty_columns,
        "constant_columns": constant_columns,
        "recommendations": recommendations
    }
