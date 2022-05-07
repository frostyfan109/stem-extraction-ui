import os
from celery import Celery

celery = Celery(
    __name__,
    broker=os.environ["CELERY_BROKER_URL"],
    backend=os.environ["CELERY_RESULT_BACKEND"]
)