from datetime import datetime
from enum import Enum
from random import choice
from sqlalchemy.ext.hybrid import hybrid_property
from storage_manager.container import StorageContainer
from . import db

def url_id():
    length = 13
    # Base64 (url-safe variant)
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-"
    id = "".join([choice(chars) for i in range(length)])
    # col_filter = {}
    # col_filter[column_name] = id
    # if Table.query.filter_by(**col_filter).first() is not None:
    #     return url_id(Table, column_name)
    return id

class StemType(Enum):
    SOURCE = 0
    OTHER = 1
    VOCALS = 2
    DRUMS = 3
    BASS = 4
    PIANO = 5

class DbFile(db.Model):
    __tablename__ = "file"
    id = db.Column(db.Integer, primary_key=True)
    url_id = db.Column(db.String, unique=True, default=url_id, nullable=False)
    separation_id = db.Column(db.Integer, db.ForeignKey("separation.id"))
    file_name = db.Column(db.String, nullable=False)
    stem_type = db.Column(db.Enum(StemType), nullable=False)
    storage_container = db.Column(db.Enum(StorageContainer), nullable=True)
    storage_id = db.Column(db.String, unique=True, nullable=True)
    creation_date = db.Column(db.DateTime(), default=datetime.utcnow)

    @hybrid_property
    def ready(self):
        return self.storage_id is None

    def serialize(self):
        return {
            "id": self.url_id,
            "file_name": self.file_name,
            "stem_type": self.stem_type.name,
            "ready": self.ready,
            "creation_date": self.creation_date.timestamp() if self.creation_date is not None else None
        }

class Separation(db.Model):
    __tablename__ = "separation"
    id = db.Column(db.Integer, primary_key=True)
    url_id = db.Column(db.String, unique=True, default=url_id, nullable=False)
    # An anonymous user can create a Separation on the server.
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    separator = db.Column(db.String(), nullable=False)
    creation_date = db.Column(db.DateTime(), default=datetime.utcnow)

    task_id = db.Column(db.String)
    
    files = db.relationship(DbFile, backref="separation", lazy="dynamic")

    @hybrid_property
    def source_file(self):
        return self.files

    def serialize(self):
        return {
            "id": self.url_id,
            "separator": self.separator,
            "files": [file.serialize() for file in self.files],
            "user": self.user.username,
            "creation_date": self.creation_date.timestamp() if self.creation_date is not None else None
        }