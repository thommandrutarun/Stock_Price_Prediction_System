# API Documentation - Stock Prediction Platform

This document describes the RESTful API endpoints exposed by the Flask backend system.

---

## 1. Authentication Endpoints (`/api/auth`)

### Register User
*   **Method**: `POST`
*   **Path**: `/api/auth/register`
*   **Payload**:
    ```json
    {
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "password": "password123",
      "phone": "+919876543210",
      "dob": "1998-05-12",
      "profession": "Trader"
    }
    ```
*   **Responses**:
    *   `201 Created` on registration success.
    *   `400 Bad Request` on invalid email/fields.

### Login User
*   **Method**: `POST`
*   **Path**: `/api/auth/login`
*   **Payload**:
    ```json
    {
      "email": "jane.doe@example.com",
      "password": "password123"
    }
    ```
*   **Responses**:
    *   `200 OK` returning authentication access token and user metadata.

---

## 2. Stock Equities and Feed Endpoints (`/api/stocks`)

### Get Stock History
*   **Method**: `GET`
*   **Path**: `/api/stocks/<symbol>/history`
*   **Parameters**: `period` (e.g. `1mo`, `3mo`, `1y`)
*   **Headers**: `Authorization: Bearer <jwt-token>`

### Get Stock Quote
*   **Method**: `GET`
*   **Path**: `/api/stocks/<symbol>/quote`
*   **Headers**: `Authorization: Bearer <jwt-token>`

### Generate LSTM Price Forecast
*   **Method**: `GET`
*   **Path**: `/api/stocks/<symbol>/predict`
*   **Parameters**: `days` (capping at 60), `interval` (e.g. `1d`, `5m`)
*   **Headers**: `Authorization: Bearer <jwt-token>`

---

## 3. Trading & Wallet Terminals (`/api/trade` / `/api/wallet`)

### Execute Buy Order
*   **Method**: `POST`
*   **Path**: `/api/trade/buy`
*   **Payload**:
    ```json
    {
      "symbol": "AAPL",
      "quantity": 5
    }
    ```

### Execute Sell Order
*   **Method**: `POST`
*   **Path**: `/api/trade/sell`
*   **Payload**:
    ```json
    {
      "symbol": "AAPL",
      "quantity": 3
    }
    ```

### Reset Wallet Balance
*   **Method**: `POST`
*   **Path**: `/api/wallet/reset`
*   **Headers**: `Authorization: Bearer <jwt-token>`
