
import pandas as pd
from io import BytesIO


def generate_excel_report(
    filename,
    profile,
    quality_report,
    analytics_report,
    insights_report
):

    output = BytesIO()

    with pd.ExcelWriter(output, engine="xlsxwriter") as writer:

        workbook = writer.book

        # Formatting
        header_format = workbook.add_format({
            "bold": True,
            "bg_color": "#263B5E",
            "font_color": "white",
            "border": 1,
            "align": "center"
        })

        title_format = workbook.add_format({
            "bold": True,
            "font_size": 16,
            "font_color": "#263B5E"
        })

        # 1. Dataset Overview
        overview = pd.DataFrame([
            ["Dataset Name", filename],
            ["Total Records", profile.get("total_rows", 0)],
            ["Total Columns", profile.get("total_columns", 0)],
            ["Duplicate Rows", profile.get("duplicate_rows", 0)]
        ], columns=["Metric", "Value"])

        overview.to_excel(
            writer,
            sheet_name="Dataset Overview",
            index=False,
            startrow=2
        )

        overview_sheet = writer.sheets["Dataset Overview"]
        overview_sheet.write("A1", "BYAnltiX - Dataset Overview", title_format)

        # 2. Data Quality
        quality = pd.DataFrame([
            ["Total Cells", quality_report.get("total_cells", 0)],
            ["Missing Cells", quality_report.get("missing_cells", 0)],
            ["Missing Percentage", quality_report.get("missing_percentage", 0)],
            ["Duplicate Rows", quality_report.get("duplicate_rows", 0)],
            ["Duplicate Percentage", quality_report.get("duplicate_percentage", 0)],
            ["Empty Columns", ", ".join(quality_report.get("empty_columns", []))],
            ["Constant Columns", ", ".join(quality_report.get("constant_columns", []))]
        ], columns=["Metric", "Value"])

        quality.to_excel(
            writer,
            sheet_name="Data Quality",
            index=False
        )

        # 3. Numeric Analytics
        numeric = analytics_report.get("numeric_analysis", {})

        numeric_df = pd.DataFrame.from_dict(
            numeric,
            orient="index"
        )

        numeric_df.index.name = "Column"

        numeric_df.to_excel(
            writer,
            sheet_name="Numeric Analytics"
        )

        # 4. Categorical Analytics
        categorical = analytics_report.get("categorical_analysis", {})

        categorical_rows = []

        for column, details in categorical.items():

            for value, count in details.get("value_distribution", {}).items():

                categorical_rows.append({
                    "Column": column,
                    "Category": value,
                    "Count": count
                })

        categorical_df = pd.DataFrame(
            categorical_rows,
            columns=["Column", "Category", "Count"]
        )

        categorical_df.to_excel(
            writer,
            sheet_name="Categorical Analytics",
            index=False
        )

        # 5. Intelligent Insights
        insights_df = pd.DataFrame({
            "Insight Number": range(1, len(insights_report) + 1),
            "Insight": insights_report
        })

        insights_df.to_excel(
            writer,
            sheet_name="Intelligent Insights",
            index=False
        )

        # Apply header formatting and column widths
        for sheet_name, worksheet in writer.sheets.items():

            worksheet.freeze_panes(1, 0)
            worksheet.set_column("A:A", 28)
            worksheet.set_column("B:B", 35)
            worksheet.set_column("C:Z", 20)

            if sheet_name != "Dataset Overview":
                worksheet.set_row(0, 25, header_format)

        # Format the overview headers
        overview_sheet.set_row(2, 25, header_format)

    output.seek(0)

    return output
