
@app.route("/api/wallet/reset", methods=["POST"])
@jwt_required()
def reset_balance():
    user_id = int(get_jwt_identity())
    conn = get_db()
    cur = conn.cursor()
    
    try:
        # Reset to 100,000
        cur.execute("UPDATE users SET wallet_balance = 100000.0 WHERE id = %s", (user_id,))
        conn.commit()
        
        # Optional: Clear portfolio? No, better to keep it or maybe user wants just cash.
        # Let's just reset cash.
        
        return jsonify({"message": "Wallet balance reset to $100,000.00", "new_balance": 100000.0}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"message": "Failed to reset balance"}), 500
    finally:
        cur.close()
        conn.close()
