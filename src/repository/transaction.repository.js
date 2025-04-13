const db = require('../database/pg.database');

exports.createTransaction = async (transaction) => {
    try {
        const result = await db.query(
            'INSERT INTO transactions (item_id, quantity, user_id, total, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [transaction.item_id, transaction.quantity, transaction.user_id, transaction.total, transaction.status]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error creating transaction', error);
        throw error;
    }
};

exports.getTransactionById = async (id) => {
    try {
        const result = await db.query('SELECT * FROM transactions WHERE id = $1', [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error getting transaction by id', error);
        throw error;
    }
};

exports.updateTransactionStatus = async (id, status) => {
    try {
        const result = await db.query('UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error updating transaction status', error);
        throw error;
    }
};

exports.deleteTransaction = async (id) => {
    try {
        const result = await db.query('DELETE FROM transactions WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error deleting transaction', error);
        throw error;
    }
};

exports.getAllTransactionsWithDetails = async () => {
    try {
        const query = `
            SELECT 
                t.*, 
                u.id AS user_id, u.name AS user_name, u.email AS user_email, u.password AS user_password, u.balance AS user_balance, u.created_at AS user_created_at,
                i.id AS item_id, i.name AS item_name, i.price AS item_price, i.store_id AS item_store_id, i.image_url AS item_image_url, i.stock AS item_stock, i.created_at AS item_created_at
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            JOIN items i ON t.item_id = i.id
        `;
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error getting transactions with details', error);
        throw error;
    }
};

exports.getPaginatedTransactions = async (offset, limit) => {
    try {
        const query = `
            SELECT 
                t.*, 
                u.id AS user_id, u.name AS user_name, u.email AS user_email, u.password AS user_password, u.balance AS user_balance, u.created_at AS user_created_at,
                i.id AS item_id, i.name AS item_name, i.price AS item_price, i.store_id AS item_store_id, i.image_url AS item_image_url, i.stock AS item_stock, i.created_at AS item_created_at
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            JOIN items i ON t.item_id = i.id
            LIMIT $1 OFFSET $2
        `;
        const result = await db.query(query, [limit, offset]);
        return result.rows;
    } catch (error) {
        console.error('Error getting paginated transactions', error);
        throw error;
    }
};