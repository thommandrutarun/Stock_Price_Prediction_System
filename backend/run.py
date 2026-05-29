from backend.app import create_app

app = create_app()

if __name__ == "__main__":
    # In production, debug should be False.
    # use_reloader=False prevents TensorFlow threading issues.
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)
