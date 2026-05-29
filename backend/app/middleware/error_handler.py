from flask import jsonify, current_app

class APIError(Exception):
    """Custom API exceptions class to return clean responses."""
    def __init__(self, message, status_code=400, payload=None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv

def register_error_handlers(app):
    """Registers standard handlers for runtime errors and custom API failures."""
    
    @app.errorhandler(APIError)
    def handle_api_error(error):
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response

    @app.errorhandler(404)
    def resource_not_found(e):
        return jsonify({"message": "Resource not found"}), 404

    @app.errorhandler(429)
    def rate_limit_exceeded(e):
        return jsonify({
            "message": "Too many requests. Please try again later.",
            "error": "Rate limit exceeded"
        }), 429

    @app.errorhandler(500)
    def internal_server_error(e):
        from backend.app.services.monitoring_service import MonitoringService
        msg = str(e)
        MonitoringService.log_metric(
            metric_type="api_error",
            message=f"Internal Server Error (500): {msg}",
            endpoint="HTTP 500 handler"
        )
        return jsonify({"message": "An internal server error occurred"}), 500

    from sqlalchemy.exc import SQLAlchemyError
    @app.errorhandler(SQLAlchemyError)
    def handle_database_error(error):
        from backend.app.services.monitoring_service import MonitoringService
        msg = str(error)
        MonitoringService.log_metric(
            metric_type="database_error",
            message=f"Database Exception: {msg}",
            endpoint="Database Event"
        )
        return jsonify({"message": "A database access error occurred. Please try again later."}), 500

