from flask import Blueprint, request, jsonify
from backend.app.models.message_model import MessageModel

contact_bp = Blueprint("contact", __name__)

@contact_bp.route("", methods=["POST"])
def contact_us():
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    subject = data.get("subject")
    message = data.get("message")

    if not name or not email or not message:
        return jsonify({"message": "Name, email, and message are required"}), 400

    try:
        success = MessageModel.create(name, email, subject, message)
        if success:
            return jsonify({"message": "Message sent successfully"}), 201
        return jsonify({"message": "Failed to send message"}), 500
    except Exception as e:
        print(f"Error saving message: {e}")
        return jsonify({"message": "Failed to send message", "error": str(e)}), 500
