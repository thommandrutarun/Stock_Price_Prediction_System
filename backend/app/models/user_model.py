import datetime as dt
import json
from sqlalchemy.sql import func
from backend.app.database.db import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, index=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20), index=True)
    dob = db.Column(db.Date)
    profession = db.Column(db.String(100))
    role = db.Column(db.String(20), default='user')
    wallet_balance = db.Column(db.Numeric(15, 2), default=100000.00)
    settings = db.Column(db.Text, default='{}')
    created_at = db.Column(db.DateTime, default=func.now())
    updated_at = db.Column(db.DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    stocks = db.relationship('UserStock', backref='user', cascade='all, delete-orphan', lazy=True)
    transactions = db.relationship('Transaction', backref='user', cascade='all, delete-orphan', lazy=True)

    def to_dict(self):
        try:
            settings_dict = json.loads(self.settings or '{}')
        except Exception:
            settings_dict = {}
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "password": self.password,
            "phone": self.phone,
            "dob": str(self.dob) if self.dob else None,
            "profession": self.profession,
            "role": self.role,
            "wallet_balance": float(self.wallet_balance or 0.0),
            "settings": settings_dict,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
            "updated_at": self.updated_at.strftime("%Y-%m-%d %H:%M:%S") if self.updated_at else None,
        }

class UserModel:
    @staticmethod
    def create(name, email, hashed_pw, phone, dob, profession, role="user", wallet_balance=100000.0, settings='{}'):
        # Safely parse date from string if provided
        parsed_dob = None
        if dob:
            if isinstance(dob, (dt.date, dt.datetime)):
                parsed_dob = dob
            elif isinstance(dob, str) and dob.strip():
                try:
                    parsed_dob = dt.datetime.strptime(dob.strip(), "%Y-%m-%d").date()
                except ValueError:
                    parsed_dob = None

        try:
            user = User(
                name=name,
                email=email,
                password=hashed_pw,
                phone=phone,
                dob=parsed_dob,
                profession=profession,
                role=role,
                wallet_balance=wallet_balance,
                settings=settings
            )
            db.session.add(user)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            print(f"Error in UserModel.create: {e}")
            return False


    @staticmethod
    def get_by_email(email):
        try:
            user = User.query.filter_by(email=email).first()
            return user.to_dict() if user else None
        except Exception as e:
            print(f"Error in UserModel.get_by_email: {e}")
            return None

    @staticmethod
    def get_by_id(user_id):
        try:
            user = User.query.get(user_id)
            return user.to_dict() if user else None
        except Exception as e:
            print(f"Error in UserModel.get_by_id: {e}")
            return None

    @staticmethod
    def get_by_email_or_phone(email, phone):
        try:
            user = User.query.filter((User.email == email) | (User.phone == phone)).first()
            return user.to_dict() if user else None
        except Exception as e:
            print(f"Error in UserModel.get_by_email_or_phone: {e}")
            return None

    @staticmethod
    def get_all():
        try:
            users = User.query.order_by(User.id).all()
            return [u.to_dict() for u in users]
        except Exception as e:
            print(f"Error in UserModel.get_all: {e}")
            return []

    @staticmethod
    def delete(user_id):
        try:
            user = User.query.get(user_id)
            if user:
                db.session.delete(user)
                db.session.commit()
                return True
            return False
        except Exception as e:
            db.session.rollback()
            print(f"Error in UserModel.delete: {e}")
            return False

    @staticmethod
    def update_role(user_id, role):
        try:
            user = User.query.get(user_id)
            if user:
                user.role = role
                db.session.commit()
                return True
            return False
        except Exception as e:
            db.session.rollback()
            print(f"Error in UserModel.update_role: {e}")
            return False

    @staticmethod
    def update_balance(user_id, new_balance):
        try:
            user = User.query.get(user_id)
            if user:
                user.wallet_balance = new_balance
                db.session.commit()
                return True
            return False
        except Exception as e:
            db.session.rollback()
            print(f"Error in UserModel.update_balance: {e}")
            return False

    @staticmethod
    def update_profile(user_id, name=None, email=None, settings=None):
        try:
            user = User.query.get(user_id)
            if user:
                if name is not None:
                    user.name = name
                if email is not None:
                    user.email = email
                if settings is not None:
                    if isinstance(settings, dict):
                        user.settings = json.dumps(settings)
                    elif isinstance(settings, str):
                        user.settings = settings
                db.session.commit()
                return True
            return False
        except Exception as e:
            db.session.rollback()
            print(f"Error in UserModel.update_profile: {e}")
            return False

