
import os
from pathlib import Path


# ==================================================
# BYAnltiX APPLICATION CONFIGURATION
# ==================================================

BASE_DIR = Path(__file__).resolve().parents[3]


# ==================================================
# APPLICATION SETTINGS
# ==================================================

APP_NAME = "BYAnltiX"

APP_VERSION = "1.0.0"

APP_DESCRIPTION = (
    "Universal Data Analytics and Report Generation Platform"
)


# ==================================================
# FILE UPLOAD SECURITY
# ==================================================

MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB

MAX_ROWS = 100000

MAX_COLUMNS = 100

ALLOWED_EXTENSIONS = {
    ".csv",
    ".xlsx",
    ".xls"
}


# ==================================================
# TEMPORARY PROCESSING SETTINGS
# ==================================================

TEMPORARY_PROCESSING = True

PERMANENT_DATASET_STORAGE = False


# ==================================================
# ENVIRONMENT SETTINGS
# ==================================================

ENVIRONMENT = os.getenv(
    "APP_ENV",
    "development"
)

DEBUG = ENVIRONMENT == "development"
