const storeController = require('../controllers/store.controller');
const express = require('express');
const router = express.Router();    


router.get('/getAll', storeController.getAllStores);
router.post('/Create', storeController.createStore);
router.get('/:id', storeController.getStore);
router.put('/', storeController.updateStore);
router.delete('/:id', storeController.deleteStore);


module.exports = router;