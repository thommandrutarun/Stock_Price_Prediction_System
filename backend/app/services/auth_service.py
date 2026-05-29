from flask_bcrypt import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token
from backend.app.models.user_model import UserModel

class AuthService:
    @staticmethod
    def register_user(name, email, password, phone, dob, profession):
        from backend.app.utils.validators import validate_email, validate_password

        if not name or not email or not password:
            raise ValueError("All fields are required")

        if not validate_email(email):
            raise ValueError("Invalid email format")

        if not validate_password(password):
            raise ValueError(
                "Password must be at least 8 characters long and contain "
                "at least one uppercase letter, one lowercase letter, one digit, and one special character"
            )

        existing_user = UserModel.get_by_email_or_phone(email, phone)
        if existing_user:
            if existing_user["email"] == email and existing_user["phone"] == phone:
                raise ValueError(f"User already exists with email {email} and phone {phone}")
            elif existing_user["email"] == email:
                raise ValueError(f"User already exists with email {email}")
            elif existing_user["phone"] == phone:
                raise ValueError(f"User already exists with phone {phone}")
            else:
                raise ValueError("User already exists")

        pw_hash = generate_password_hash(password).decode("utf-8")
        success = UserModel.create(
            name=name,
            email=email,
            hashed_pw=pw_hash,
            phone=phone,
            dob=dob,
            profession=profession,
            role="user",
            wallet_balance=100000.0
        )
        if not success:
            raise RuntimeError("Database write error occurred during registration")

        return {"message": "Registered successfully"}

    @staticmethod
    def login_user(email, password):
        if not email or not password:
            raise ValueError("Email and password are required")

        user = UserModel.get_by_email(email)
        if not user or not check_password_hash(user["password"], password):
            raise ValueError("Invalid credentials")

        access_token = create_access_token(identity=str(user["id"]))
        refresh_token = create_refresh_token(identity=str(user["id"]))
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "email": user["email"],
                "name": user["name"],
                "role": user["role"],
                "wallet_balance": float(user.get("wallet_balance") or 0)
            }
        }
