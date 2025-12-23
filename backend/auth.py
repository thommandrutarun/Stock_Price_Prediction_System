# auth.py – optional helpers, no routes needed if app.py already defines them
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager

bcrypt = Bcrypt()
jwt = JWTManager()
