from abc import ABC, abstractmethod
from dataclasses import dataclass
from .container import StorageContainer

@dataclass
class StorageFile:
    file: bytes
    file_extension: str
    identifier: str
    container: StorageContainer

class StorageManager(ABC):
    container_type: StorageContainer = None
    
    def __init__(self):
        ...
    

    @abstractmethod
    def upload_file_bytes(self, file: bytes, file_extension: str, key: str="") -> StorageFile:
        """
        Uploads a file blob to the storage container.

            Parameters:
                file (bytes): Uploaded file object
                file_extension (str): File extension (without dot)
                key (str): Prefixed (traditionally path) key for the generated file identifier

            Returns:
                file (File): File blob, extension, identifier, container
        """
        pass

    @abstractmethod
    def download_file_bytes(self, identifier: str) -> StorageFile:
        """
        Retrieves a file blob from the storage container.

            Parameters:
                identifier (str): Unique file identifier
            
            Returns:
                file (File): File blob, extension, identifier, container
        """
        pass