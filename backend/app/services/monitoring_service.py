from backend.app.database.db import db
from backend.app.models.metric_model import SystemMetric
from sqlalchemy.sql import func
import logging

logger = logging.getLogger("app.monitoring")

class MonitoringService:
    @staticmethod
    def log_metric(metric_type, message, execution_time=None, endpoint=None):
        """Durable persistence for metrics and application warnings/errors."""
        try:
            # Print to standard python app output logs
            log_msg = f"[{metric_type.upper()}] Endpoint: {endpoint} | Msg: {message}"
            if execution_time is not None:
                log_msg += f" | Time: {execution_time}ms"
            
            if "error" in metric_type or "failure" in metric_type:
                logger.error(log_msg)
            else:
                logger.info(log_msg)

            # Persist to sql database
            metric = SystemMetric(
                metric_type=metric_type,
                message=message,
                execution_time=execution_time,
                endpoint=endpoint
            )
            db.session.add(metric)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            logger.critical(f"Failed to log metric in DB: {e}")
            return False

    @staticmethod
    def get_monitoring_summary():
        """Retrieve aggregated metrics summaries and performance stats for the dashboard."""
        try:
            total_api_errors = SystemMetric.query.filter_by(metric_type='api_error').count()
            total_login_failures = SystemMetric.query.filter_by(metric_type='login_failure').count()
            total_db_errors = SystemMetric.query.filter_by(metric_type='database_error').count()
            total_ai_errors = SystemMetric.query.filter_by(metric_type='ai_error').count()

            # Average response time of endpoints
            perf_stats = db.session.query(
                SystemMetric.endpoint,
                func.avg(SystemMetric.execution_time).label('avg_time'),
                func.count(SystemMetric.id).label('call_count')
            ).filter_by(metric_type='performance').group_by(SystemMetric.endpoint).all()

            performance = [
                {"endpoint": row.endpoint, "avg_time_ms": round(float(row.avg_time), 2), "count": row.call_count}
                for row in perf_stats if row.endpoint
            ]

            # Recent error log
            recent_logs = SystemMetric.query.filter(
                SystemMetric.metric_type != 'performance'
            ).order_by(SystemMetric.timestamp.desc()).limit(50).all()

            return {
                "counts": {
                    "api_error": total_api_errors,
                    "login_failure": total_login_failures,
                    "database_error": total_db_errors,
                    "ai_error": total_ai_errors
                },
                "performance": performance,
                "recent_logs": [log.to_dict() for log in recent_logs]
            }
        except Exception as e:
            logger.critical(f"Error compiling monitoring summary: {e}")
            return {"counts": {}, "performance": [], "recent_logs": []}
