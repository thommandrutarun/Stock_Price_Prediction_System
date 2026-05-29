# Render Production Secret Management Guide

This guide details how to securely configure secrets and environment variables for the Stock Price Prediction Platform backend on [Render](https://render.com).

---

## 1. Required Environment Variables

When deploying the backend service (`stock-backend-api`) to Render, configure the following environment variables in the **Environment** tab of your service dashboard:

| Variable Name | Description | Render Setup | Example Value |
| :--- | :--- | :--- | :--- |
| `FLASK_ENV` | Run mode | Pre-configured in `render.yaml` | `production` |
| `FLASK_DEBUG` | Debug logging | Pre-configured in `render.yaml` | `false` |
| `SECRET_KEY` | Flask session signature key | **Auto-generated** by Render | *(Auto-generated)* |
| `JWT_SECRET_KEY` | JWT signing key | **Auto-generated** by Render | *(Auto-generated)* |
| `SUPER_ADMIN_EMAIL` | Admin identifier | Manual Input | `admin@yourdomain.com` |
| `CORS_ALLOWED_ORIGINS` | Permitted frontend origins | Manual Input (Comma-separated) | `https://your-frontend-domain.onrender.com` |
| `DATABASE_URL` | PostgreSQL connection string | Injected automatically or manually | `postgresql://db_user:password@host:port/db_name` |
| `DB_HOST` | MySQL hostname (if using MySQL) | Manual Input (Only if not using PostgreSQL) | `mysql-db.example.com` |
| `DB_USER` | MySQL user (if using MySQL) | Manual Input | `root` |
| `DB_PASSWORD` | MySQL password (if using MySQL) | Manual Input | `your_secure_password` |
| `DB_NAME` | MySQL database name | Manual Input | `stock_prediction` |

---

## 2. Dynamic Secret Generation

For `SECRET_KEY` and `JWT_SECRET_KEY`, the `render.yaml` blueprint is configured with `generateValue: true`. 
- Upon first deployment, Render will automatically generate a secure, high-entropy, random value for these variables.
- You do not need to generate or paste these keys manually. They are automatically kept private and persistent.

---

## 3. Best Practices for Render Environment Configurations

### A. Use Environment Groups
If you manage multiple related services (e.g., the API backend and background worker tasks), define an **Environment Group** in your Render Dashboard:
1. Navigate to **Environment Groups** in the Render Dashboard.
2. Click **Create Environment Group**.
3. Name it (e.g., `stock-platform-secrets`).
4. Add all shared database settings, admin preferences, and origins.
5. In your individual services, link the environment group to automatically inject all variables.

### B. Securing Database Connections
- **Preferred Option (PostgreSQL)**: If deploying a PostgreSQL database on Render, copy the **Internal Database URL** and bind it to the `DATABASE_URL` variable in your backend environment tab. The backend connector will automatically detect `DATABASE_URL` and route all transactions through PostgreSQL instead of local MySQL!
- **Fallback Option (External Database)**: Ensure that your external database provider permits connections from Render's IP addresses, or route traffic securely through a VPC connection.
