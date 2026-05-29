import datetime as dt

def format_currency(val, symbol="$"):
    """Formates floats into safe currency outputs."""
    try:
        return f"{symbol}{float(val):,.2f}"
    except (ValueError, TypeError):
        return f"{symbol}0.00"

def get_current_timestamp():
    """Generates standard datetime database formatted strings."""
    return dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
