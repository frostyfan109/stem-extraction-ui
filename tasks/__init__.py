import time
import tempfile
import config
from separators import separators
from storage_manager import StorageManagerFactory
from storage_manager.container import StorageContainer
from .celery import celery
from subprocess import Popen, PIPE

@celery.task(name="test_task", bind=True)
def test(self):
    return 512


@celery.task(name="separate_task", bind=True)
def separate(self, separator_key, file_identifier, file_container_value, args):
    separator = [separator for separator in separators if separator.key == separator_key][0]
    file_container = StorageContainer(file_container_value)
    storage_manager = StorageManagerFactory.create(file_container)
    file = storage_manager.download_file_bytes(file_identifier)
    print("Ready")
    with tempfile.NamedTemporaryFile(suffix="." + file.file_extension) as f:
        f.write(file.file)
        for i in range(180):
            self.update_state(state="PROGRESS", meta={
                "current": i * (100/180),
                "total": 100
            })
            time.sleep(config.POLL_DELAY)
        # process = Popen(separator.create_cli_args([f.filename], args), stdout=PIPE)
    # Create files on DB
    ...
    return {
        "current": 100,
        "total": 100,
        "message": "Success",
        "result": None
    }