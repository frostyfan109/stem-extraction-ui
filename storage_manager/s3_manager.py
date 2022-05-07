import boto3
from uuid import uuid4

from .container import StorageContainer
from .manager import StorageManager, StorageFile

def generate_identifier(key, file_extension):
    uuid = uuid4().hex
    identifier = f"{key}/{uuid[0]}/{uuid[1]}/{uuid[2]}/{uuid[3:]}.{file_extension}"
    return identifier

class S3Storage(StorageManager):
    container_type = StorageContainer.S3
    def __init__(self, aws_credentials: dict):
        self.s3 = boto3.resource(
            "s3",
            aws_access_key_id=aws_credentials["access_key"],
            aws_secret_access_key=aws_credentials["secret_key"]
        )
        self.bucket = aws_credentials["bucket"]

    def _generate_unique_object(self, key, file_extension):
        identifier = generate_identifier(key, file_extension)
        object = self.s3.Object(self.bucket, key=identifier)
        try:
            # If this doesn't throw, it means the object/identifier already exists
            object.get()
            return self._generate_unique_object(key, file_extension)
        except:
            # Identifier is unique.
            return object, identifier
    def upload_file_bytes(self, file, file_extension, key=""):
        object, identifier = self._generate_unique_object(key, file_extension)
        object.put(Body=file)
        return StorageFile(
            file=file,
            file_extension=file_extension,
            identifier=identifier,
            container=self.container_type
        )

    def download_file_bytes(self, identifier):
        object = self.s3.Object(self.bucket, key=identifier)
        res = object.get()
        return StorageFile(
            file=res["Body"].read(),
            file_extension=identifier.split(".")[-1],
            identifier=identifier,
            container=self.container_type
        )