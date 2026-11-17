
from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Request
)

from fastapi.responses import StreamingResponse

from slowapi import Limiter

import pandas as pd
import io

from backend.app.core.config import (
    MAX_FILE_SIZE,
    MAX_ROWS,
    MAX_COLUMNS,
    ALLOWED_EXTENSIONS
)

from backend.app.core.rate_limiter import limiter

from backend.app.analytics.engine import generate_analytics
from backend.app.analytics.visualizations import generate_visualizations
from backend.app.analytics.insights import generate_insights

from backend.app.services.profiling import generate_profile
from backend.app.services.quality import analyze_data_quality

from backend.app.services.report_generator import generate_pdf_report
from backend.app.services.excel_generator import generate_excel_report


# ==================================================
# 1. API ROUTER
# ==================================================

router = APIRouter(
    prefix="/api/datasets",
    tags=["Dataset Upload"]
)


# ==================================================
# 2. FILE VALIDATION
# ==================================================

def validate_file(file):

    filename = (file.filename or "").lower()

    allowed_extensions = tuple(ALLOWED_EXTENSIONS)

    if not filename.endswith(allowed_extensions):

        raise HTTPException(
            status_code=400,
            detail="Only CSV, XLSX and XLS files are supported."
        )

    return filename


# ==================================================
# 3. READ UPLOADED FILE
# ==================================================

async def get_uploaded_content(file):

    content = bytearray()

    try:

        while True:

            chunk = await file.read(1024 * 1024)

            if not chunk:
                break

            content.extend(chunk)

            if len(content) > MAX_FILE_SIZE:

                max_size_mb = MAX_FILE_SIZE // (1024 * 1024)

                raise HTTPException(
                    status_code=413,
                    detail=(
                        f"File exceeds the maximum upload "
                        f"limit of {max_size_mb} MB."
                    )
                )

        if not content:

            raise HTTPException(
                status_code=400,
                detail="Uploaded dataset is empty."
            )

        return bytes(content)

    finally:

        await file.close()


# ==================================================
# 4. DATASET READING
# ==================================================

def read_dataset(filename, content):

    try:

        if filename.endswith(".csv"):

            df = pd.read_csv(
                io.BytesIO(content)
            )

        elif filename.endswith((".xlsx", ".xls")):

            df = pd.read_excel(
                io.BytesIO(content)
            )

        else:

            raise HTTPException(
                status_code=400,
                detail="Unsupported file format."
            )

    except HTTPException:
        raise

    except Exception:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unable to read the uploaded dataset. "
                "Please check that the file is valid and try again."
            )
        )

    # Check empty dataset

    if df.empty or len(df.columns) == 0:

        raise HTTPException(
            status_code=400,
            detail="The uploaded dataset contains no usable data."
        )

    # Check maximum rows

    if len(df) > MAX_ROWS:

        raise HTTPException(
            status_code=413,
            detail=(
                f"Dataset exceeds the maximum limit "
                f"of {MAX_ROWS} rows."
            )
        )

    # Check maximum columns

    if len(df.columns) > MAX_COLUMNS:

        raise HTTPException(
            status_code=413,
            detail=(
                f"Dataset exceeds the maximum limit "
                f"of {MAX_COLUMNS} columns."
            )
        )

    # Check duplicate column names

    if df.columns.duplicated().any():

        raise HTTPException(
            status_code=400,
            detail="Dataset contains duplicate column names."
        )

    # Check blank column names

    if any(not str(column).strip() for column in df.columns):

        raise HTTPException(
            status_code=400,
            detail="Dataset contains blank column names."
        )

    return df


# ==================================================
# 5. DATASET ANALYSIS
# ==================================================

def analyze_dataset(df):

    profile = generate_profile(df)

    quality_report = analyze_data_quality(df)

    analytics_report = generate_analytics(df)

    visualization_report = generate_visualizations(df)

    insights_report = generate_insights(df)

    return {

        "profile": profile,

        "data_quality": quality_report,

        "analytics": analytics_report,

        "visualizations": visualization_report,

        "insights": insights_report

    }


# ==================================================
# 6. DATASET UPLOAD API
# RATE LIMIT: 10 REQUESTS PER HOUR
# ==================================================

@router.post("/upload")
@limiter.limit("10/hour")
async def upload_dataset(
    request: Request,
    file: UploadFile = File(...)
):

    filename = validate_file(file)

    content = await get_uploaded_content(file)

    df = read_dataset(filename, content)

    reports = analyze_dataset(df)

    preview = (
        df.head(5)
        .fillna("")
        .to_dict(orient="records")
    )

    return {

        "message": "Dataset uploaded and analyzed successfully.",

        "filename": file.filename,

        **reports,

        "preview": preview

    }


# ==================================================
# 7. PDF REPORT API
# RATE LIMIT: 10 REQUESTS PER HOUR
# ==================================================

@router.post("/report/pdf")
@limiter.limit("10/hour")
async def download_pdf_report(
    request: Request,
    file: UploadFile = File(...)
):

    filename = validate_file(file)

    content = await get_uploaded_content(file)

    df = read_dataset(filename, content)

    reports = analyze_dataset(df)

    pdf_buffer = generate_pdf_report(

        filename=file.filename,

        profile=reports["profile"],

        quality_report=reports["data_quality"],

        analytics_report=reports["analytics"],

        insights_report=reports["insights"]

    )

    return StreamingResponse(

        pdf_buffer,

        media_type="application/pdf",

        headers={

            "Content-Disposition":
            'attachment; filename="BYAnltiX_Report.pdf"'

        }

    )


# ==================================================
# 8. EXCEL REPORT API
# RATE LIMIT: 10 REQUESTS PER HOUR
# ==================================================

@router.post("/report/excel")
@limiter.limit("10/hour")
async def download_excel_report(
    request: Request,
    file: UploadFile = File(...)
):

    filename = validate_file(file)

    content = await get_uploaded_content(file)

    df = read_dataset(filename, content)

    reports = analyze_dataset(df)

    excel_buffer = generate_excel_report(

        filename=file.filename,

        profile=reports["profile"],

        quality_report=reports["data_quality"],

        analytics_report=reports["analytics"],

        insights_report=reports["insights"]

    )

    return StreamingResponse(

        excel_buffer,

        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),

        headers={

            "Content-Disposition":
            'attachment; filename="BYAnltiX_Analysis_Report.xlsx"'

        }

    )
