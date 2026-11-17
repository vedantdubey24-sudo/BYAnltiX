
import os

from fastapi.middleware.cors import CORSMiddleware


# ==================================================
# BYAnltiX CORS CONFIGURATION
# ==================================================

def configure_cors(app):

    default_origins = (
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "http://localhost:3000,"
        "http://127.0.0.1:3000"
    )

    allowed_origins = os.getenv(
        "CORS_ORIGINS",
        default_origins
    ).split(",")

    allowed_origins = [
        origin.strip().rstrip("/")
        for origin in allowed_origins
        if origin.strip()
    ]

    app.add_middleware(
        CORSMiddleware,

        allow_origins=allowed_origins,

        allow_credentials=True,

        allow_methods=[
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS"
        ],

        allow_headers=[
            "Content-Type",
            "Authorization"
        ]
    )
