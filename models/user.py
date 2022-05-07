from datetime import datetime
from sqlalchemy.ext.hybrid import hybrid_property

from .separation import Separation
from . import db, bcrypt

class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(16), unique=True, index=True)
    email = db.Column(db.String(256), unique=True, index=True)
    email_confirmed = db.Column(db.Boolean, default=False)
    password_hash = db.Column(db.String(128))
    creation_date = db.Column(db.DateTime(), default=datetime.utcnow)
    last_seen = db.Column(db.DateTime(), default=datetime.utcnow)

    separations = db.relationship(Separation, backref="user", lazy="dynamic")

    @hybrid_property
    def password(self):
        return self.password_hash

    @password.setter
    def password(self, plain_text):
        self.password_hash = bcrypt.generate_password_hash(plain_text)

    def verify_password(self, plain_text):
        return bcrypt.check_password_hash(self.password, plain_text)
    
    def serialize(self):
        return {
            "username": self.username
        }
