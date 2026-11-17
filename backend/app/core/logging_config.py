
import logging
import sys


def setup_logging():

    logging.basicConfig(
        level=logging.INFO,

        format=(
            "%(asctime)s | "
            "%(levelname)s | "
            "%(name)s | "
            "%(message)s"
        ),

        handlers=[
            logging.StreamHandler(sys.stdout)
        ],

        force=True
    )

    # Reduce unnecessary framework logs

    logging.getLogger("uvicorn.access").setLevel(
        logging.WARNING
    )

    logging.getLogger("multipart").setLevel(
        logging.WARNING
    )

    return logging.getLogger("BYAnltiX")
