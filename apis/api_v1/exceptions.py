from werkzeug.exceptions import HTTPException

class APIException(HTTPException):
    def __init__(self, message, data):
        super().__init__(
            message
        )
        # `data` is a reserved member
        self._data = data