from werkzeug.exceptions import HTTPException, Forbidden

class APIException(HTTPException):
    def __init__(self, message, data={}):
        super().__init__(
            message
        )
        # `data` is a reserved member
        self._data = data

class LoginDisabled(APIException, Forbidden):
    def __init__(self):
        super().__init__("The server does not currently have login enabled.")