const userController = require('../controllers/user.controller');
const express = require('express');
const router = express.Router();

router.get('/getAll', userController.getAllUsers);
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/:email', userController.getUserByEmail);
router.put('/', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/topUp', userController.topUp); 
module.exports = router;