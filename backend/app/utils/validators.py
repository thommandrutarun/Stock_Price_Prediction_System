import re

def validate_email(email):
    """Validates the structure of email strings."""
    if not email:
        return False
    email_regex = r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
    return bool(re.match(email_regex, email))

def validate_password(password):
    """
    Validates password strength.
    Requires:
    - Minimum 8 characters in length
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character from the set [@$!%*?&#^()_+-=]
    """
    if not password:
        return False
    if len(password) < 8:
        return False
    if not any(char.isupper() for char in password):
        return False
    if not any(char.islower() for char in password):
        return False
    if not any(char.isdigit() for char in password):
        return False
    special_chars = re.compile(r'[@$!%*?&#^()_+\-=]')
    if not special_chars.search(password):
        return False
    return True
