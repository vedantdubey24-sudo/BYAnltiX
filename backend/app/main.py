
from fastapi import FastAPI

from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

from backend.app.api.datasets import router as datasets_router

from backend.app.core.logging_config import setup_logging

from backend.app.core.security import configure_cors

from backend.app.core.rate_limiter import limiter

from backend.app.core.config import (
    APP_NAME,
    APP_VERSION,
    APP_DESCRIPTION
)


# ==================================================
# 1. INITIALIZE APPLICATION LOGGING
# ==================================================

logger = setup_logging()


# ==================================================
# 2. CREATE FASTAPI APPLICATION
# ==================================================

app = FastAPI(

    title=APP_NAME,

    description=APP_DESCRIPTION,

    version=APP_VERSION

)


# ==================================================
# 3. CONFIGURE RATE LIMITING
# ==================================================

app.state.limiter = limiter

app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler
)


# ==================================================
# 4. CONFIGURE CORS SECURITY
# ==================================================

configure_cors(app)


# ==================================================
# 5. REGISTER API ROUTES
# ==================================================

app.include_router(datasets_router)


# ==================================================
# 6. HOME ENDPOINT
# ==================================================

@app.get("/")
def home():

    logger.info(
        "BYAnltiX API home endpoint accessed"
    )

    return {

        "message": "Welcome to BYAnltiX API",

        "tagline": "Where Data Reveals Its Insights.",

        "status": "Backend is running successfully"

    }


# ==================================================
# 7. HEALTH CHECK ENDPOINT
# ==================================================

@app.get("/health")
def health_check():

    return {

        "status": "healthy",

        "application": APP_NAME

    }


# ==================================================
# 8. API INFORMATION ENDPOINT
# ==================================================

@app.get("/api/info")
def api_info():

    return {

        "application": APP_NAME,

        "version": APP_VERSION,

        "description": APP_DESCRIPTION,

        "available_features": [

            "Universal Dataset Upload",

            "Automatic Dataset Profiling",

            "Data Quality Analysis",

            "Dynamic Data Analytics",

            "Data Visualization",

            "Intelligent Insights",

            "PDF Report Generation",

            "Excel Report Generation",

            "API Rate Limiting"

        ]

    }
