const transactionRepository = require('../repository/transaction.repository');
const itemRepository = require('../repository/item.repository');
const userRepository = require('../repository/user.repository');
const baseResponse = require('../utils/baseResponse.util');

exports.createTransaction = async (req, res) => {
    const { item_id, quantity, user_id } = req.body;
    if (!item_id || !quantity || !user_id) {
        return baseResponse(res, false, 400, 'Item ID, quantity, and user ID are required', null);
    }
    if (quantity <= 0) {
        return baseResponse(res, false, 400, 'Quantity must be larger than 0', null);
    }
    try {
        const item = await itemRepository.getItemsById(item_id);
        if (!item) {
            return baseResponse(res, false, 404, 'Item not found', null);
        }
        const user = await userRepository.getUser(user_id);
        if (!user) {
            return baseResponse(res, false, 404, 'User not found', null);
        }
        const total = item.price * quantity;
        const newTransaction = await transactionRepository.createTransaction({ item_id, quantity, user_id, total, status: 'pending' });
        return baseResponse(res, true, 201, 'Transaction created', newTransaction);
    } catch (error) {
        console.error('Error creating transaction:', error);
        return baseResponse(res, false, 500, 'Error creating transaction', error);
    }
};

exports.payTransaction = async (req, res) => {
    const { id } = req.params;
    try {
        const transaction = await transactionRepository.getTransactionById(id);
        if (!transaction) {
            return baseResponse(res, false, 404, 'Transaction not found', null);
        }
        if (transaction.status !== 'pending') {
            return baseResponse(res, false, 400, 'Transaction is not pending', null);
        }
        const item = await itemRepository.getItemsById(transaction.item_id);
        if (!item) {
            return baseResponse(res, false, 404, 'Item not found', null);
        }
        if (item.stock < transaction.quantity) {
            return baseResponse(res, false, 400, 'Not enough stock', null);
        }
        const user = await userRepository.getUser(transaction.user_id);
        if (!user) {
            return baseResponse(res, false, 404, 'User not found', null);
        }
        if (user.balance < transaction.total) {
            return baseResponse(res, false, 400, 'Not enough balance', null);
        }
        await itemRepository.updateItemStock(item.id, item.stock - transaction.quantity);
        await userRepository.updateUserBalance(user.id, user.balance - transaction.total);
        const updatedTransaction = await transactionRepository.updateTransactionStatus(id, 'paid');
        return baseResponse(res, true, 200, 'Payment successful', updatedTransaction);
    } catch (error) {
        console.error('Error paying transaction:', error);
        return baseResponse(res, false, 500, 'Failed to pay', error);
    }
};

exports.deleteTransaction = async (req, res) => {
    const { id } = req.params;
    try {
        const transaction = await transactionRepository.getTransactionById(id);
        if (!transaction) {
            return baseResponse(res, false, 404, 'Transaction not found', null);
        }
        await transactionRepository.deleteTransaction(id);
        return baseResponse(res, true, 200, 'Transaction deleted', transaction);
    } catch (error) {
        console.error('Error deleting transaction:', error);
        return baseResponse(res, false, 500, 'Error deleting transaction', error);
    }
};

exports.getAllTransactions = async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Default page = 1, limit = 10
    const offset = (page - 1) * limit;

    try {
        const transactions = await transactionRepository.getPaginatedTransactions(offset, limit);
        const formattedTransactions = transactions.map(transaction => ({
            id: transaction.id,
            user_id: transaction.user_id,
            item_id: transaction.item_id,
            quantity: transaction.quantity,
            total: transaction.total,
            status: transaction.status,
            created_at: transaction.created_at,
            user: {
                id: transaction.user_id,
                name: transaction.user_name,
                email: transaction.user_email,
                password: transaction.user_password,
                balance: transaction.user_balance,
                created_at: transaction.user_created_at
            },
            item: {
                id: transaction.item_id,
                name: transaction.item_name,
                price: transaction.item_price,
                store_id: transaction.item_store_id,
                image_url: transaction.item_image_url,
                stock: transaction.item_stock,
                created_at: transaction.item_created_at
            }
        }));
        return baseResponse(res, true, 200, 'Transactions found', formattedTransactions);
    } catch (error) {
        console.error('Error getting transactions:', error);
        return baseResponse(res, false, 500, 'Error retrieving transactions', error);
    }
};