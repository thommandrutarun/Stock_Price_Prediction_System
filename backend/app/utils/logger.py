import logging
import json
import sys
import time

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            "timestamp": time.strftime('%Y-%m-%dT%H:%M:%S', time.gmtime(record.created)),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "line": record.lineno
        }
        return json.dumps(log_entry)

def setup_logger():
    logger = logging.getLogger("platform_monitor")
    logger.setLevel(logging.INFO)
    
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    logger.addHandler(handler)
    return logger

monitor_logger = setup_logger()
