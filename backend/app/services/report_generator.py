
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak
)


def generate_pdf_report(
    filename,
    profile,
    quality_report,
    analytics_report,
    insights_report
):
    """
    Generate a PDF report containing dataset profiling,
    data quality, analytics and insights.
    """

    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=45,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontSize=22,
        spaceAfter=10
    )

    heading_style = styles["Heading2"]
    normal_style = styles["BodyText"]

    story = []

    # 1. Report title
    story.append(
        Paragraph("BYAnltiX - Dataset Analysis Report", title_style)
    )

    story.append(
        Paragraph(f"<b>Dataset:</b> {filename}", normal_style)
    )

    story.append(Spacer(1, 20))

    # 2. Dataset overview
    story.append(Paragraph("1. Dataset Overview", heading_style))

    overview_data = [
        ["Metric", "Value"],
        ["Total Records", str(profile.get("total_rows", 0))],
        ["Total Columns", str(profile.get("total_columns", 0))],
        ["Duplicate Rows", str(profile.get("duplicate_rows", 0))]
    ]

    overview_table = Table(
        overview_data,
        colWidths=[220, 220]
    )

    overview_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#263B5E")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("PADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE")
    ]))

    story.append(overview_table)
    story.append(Spacer(1, 20))

    # 3. Data quality
    story.append(Paragraph("2. Data Quality Analysis", heading_style))

    quality_data = [
        ["Metric", "Value"],
        ["Total Cells", str(quality_report.get("total_cells", 0))],
        ["Missing Cells", str(quality_report.get("missing_cells", 0))],
        ["Missing Percentage",
         f"{quality_report.get('missing_percentage', 0)}%"],
        ["Duplicate Rows", str(quality_report.get("duplicate_rows", 0))]
    ]

    quality_table = Table(
        quality_data,
        colWidths=[220, 220]
    )

    quality_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#263B5E")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("PADDING", (0, 0), (-1, -1), 8)
    ]))

    story.append(quality_table)
    story.append(Spacer(1, 12))

    story.append(Paragraph("<b>Recommendations:</b>", normal_style))

    for recommendation in quality_report.get("recommendations", []):
        story.append(Paragraph(f"- {recommendation}", normal_style))
        story.append(Spacer(1, 4))

    story.append(Spacer(1, 16))

    # 4. Numeric analytics
    story.append(Paragraph("3. Numeric Analytics", heading_style))

    numeric_analysis = analytics_report.get("numeric_analysis", {})

    if numeric_analysis:

        numeric_data = [
            ["Column", "Average", "Minimum", "Maximum"]
        ]

        for column, stats in numeric_analysis.items():
            numeric_data.append([
                str(column),
                str(stats.get("average", "N/A")),
                str(stats.get("minimum", "N/A")),
                str(stats.get("maximum", "N/A"))
            ])

        numeric_table = Table(
            numeric_data,
            repeatRows=1,
            colWidths=[145, 100, 100, 100]
        )

        numeric_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#263B5E")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("PADDING", (0, 0), (-1, -1), 6)
        ]))

        story.append(numeric_table)

    else:
        story.append(Paragraph("No numeric columns detected.", normal_style))

    story.append(Spacer(1, 20))

    # 5. Dataset insights
    story.append(Paragraph("4. Intelligent Insights", heading_style))

    if insights_report:
        for index, insight in enumerate(insights_report, start=1):
            story.append(
                Paragraph(f"{index}. {insight}", normal_style)
            )
            story.append(Spacer(1, 7))
    else:
        story.append(Paragraph("No insights available.", normal_style))

    # 6. Footer
    story.append(Spacer(1, 25))
    story.append(
        Paragraph(
            "Generated automatically by BYAnltiX - "
            "Where Data Reveals Its Insights.",
            styles["Italic"]
        )
    )

    # Build PDF
    document.build(story)

    buffer.seek(0)

    return buffer
