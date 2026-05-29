# Database Design - Stock Prediction Platform

This document describes the schema constraints, indexes, and table structures inside the database.

---

## 1. Entity Relationships (ERD Mapping)

The database maps 5 major relations:

```
[users] 1 -------- 0..* [user_stocks] (Portfolio Positions)
   |
   +--- 1 -------- 0..* [transactions] (Simulated Ledger)
```

---

## 2. Table Specifications

### Users Table (`users`)
*   Stores credentials and account funds.
*   **Indexes**: `email` is configured as a `UNIQUE` identifier.

### User Stocks Table (`user_stocks`)
*   Tracks user portfolio positions.
*   **Foreign Key**: `user_id` references `users(id)` with `ON DELETE CASCADE`.

### Transactions Table (`transactions`)
*   Tracks virtual buy/sell events.
*   **Foreign Key**: `user_id` references `users(id)` with `ON DELETE CASCADE`.
