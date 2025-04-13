const express = require('express');
const { body } = require('express-validator');
const transactionController = require('../controllers/transaction.controller');

const router = express.Router();

router.post(
    '/create',
    [
        body('item_id').isUUID().withMessage('Invalid item ID'),
        body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
        body('user_id').isUUID().withMessage('Invalid user ID')
    ],
    transactionController.createTransaction
);
router.post('/pay/:id', transactionController.payTransaction);
router.delete('/:id', transactionController.deleteTransaction);
router.get('/', transactionController.getAllTransactions);

module.exports = router;