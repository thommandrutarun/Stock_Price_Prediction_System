# Deployment Guide - Stock Prediction Platform

This guide outlines containerized staging steps and cloud production mapping procedures.

---

## 1. Local Containerized Staging (Docker Compose)

To spin up the entire application locally including the MySQL database:

1.  **Ensure Docker is installed and running**.
2.  Navigate to the `deployment/docker` directory:
    ```bash
    cd deployment/docker
    ```
3.  Launch the orchestration services:
    ```bash
    docker-compose up --build
    ```
4.  The application will be hosted on `http://localhost`. Nginx stage acts as a reverse proxy forwarding `/api` queries to the Flask container and serving static React assets.

---

## 2. Cloud Staging (Render.com / Render Blueprint)

The codebase contains a pre-configured `render.yaml` blueprint:

1.  Create an account or login to **Render.com**.
2.  Navigate to the **Blueprints** tab and link your Git repository.
3.  Render will auto-discover the `render.yaml` configuration and launch:
    *   A static web service serving React bundle.
    *   A Python web service starting the Flask backend API.
4.  Configure environment secrets (`DB_HOST`, `DB_PASSWORD`, etc.) inside the Render dashboard panel.

---

## 3. Render Secret Management Settings

To host the Stock Prediction Platform securely on Render without committing any secrets to your repository:

1.  **Configure Environment Variables**:
    *   Do **NOT** upload your `.env` file to your Git repository (the `.gitignore` file automatically protects this).
    *   Navigate to your backend Web Service page in the **Render Dashboard**.
    *   Go to the **Environment** tab.
    *   Define your variables individually by clicking **Add Environment Variable**.
2.  **Required Render Environment Variables**:
    *   `FLASK_ENV`: Set to `production` to activate strict security checks.
    *   `SECRET_KEY`: Set to a strong key string (e.g. generated via `openssl rand -hex 32`).
    *   `JWT_SECRET_KEY`: Set to a secure key string.
    *   `DB_HOST`: Set to your external database server host IP/URL.
    *   `DB_USER`: Set to your database username.
    *   `DB_PASSWORD`: Set to your database password.
    *   `DB_NAME`: Set to `stock_prediction`.
    *   `CORS_ALLOWED_ORIGINS`: Set to your React frontend client URL (e.g. `https://your-app.onrender.com`).
3.  **Render Environment Groups**:
    *   For easier management, you can create an **Environment Group** (e.g. `stock-prediction-secrets`) in the Render sidebar dashboard.
    *   Define all credentials in the group once, then link this environment group to your backend Web Service.
