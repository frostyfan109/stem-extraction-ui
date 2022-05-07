import config

from .manager import StorageManager
from .container import StorageContainer
from .s3_manager import S3Storage

"""
Ideally would be static methods of StorageManager itself,
but moved due to circular imports caused by pattern.
"""
class StorageManagerFactory:
    @classmethod
    def create(cls, storage_container: StorageContainer) -> StorageManager:
        if storage_container == StorageContainer.S3:
            return S3Storage({
                "access_key": config.AWS_ACCESS_KEY,
                "secret_key": config.AWS_SECRET_KEY,
                "bucket": config.AWS_BUCKET_NAME
            })

    @classmethod
    def get(cls) -> StorageManager:
        storage_env = config.STORAGE.lower()
        if storage_env == "s3":
            return cls.create(StorageContainer.S3)
        raise Exception(f"Unknown env `STORAGE={config.STORAGE}`")