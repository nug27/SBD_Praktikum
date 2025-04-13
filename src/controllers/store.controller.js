const storeRepository = require('../repository/store.repository');
const baseResponse = require('../utils/baseResponse.util');

exports.getAllStores = async (req, res) => {
  try {
    const stores = await storeRepository.getAllStores();
    baseResponse(res, true, 200, 'Stores retrieved successfully', stores);
  } catch (error) {
    baseResponse(res, false, 500, 'Error getting stores', null);
  }
}

exports.createStore = async (req, res) => {   
  if (!req.body.name || !req.body.address) {
    return baseResponse(res, false, 400, 'Name and address are required', null);
  }
  try {
    const newStore = await storeRepository.createStore(req.body);
    baseResponse(res, true, 201, 'Store created successfully', newStore);
  } catch (error) {
    baseResponse(res, false, 500, error.message, null);
  }
}

exports.getStore = async (req, res) => {
  try {
    const store = await storeRepository.getStore(req.params.id);
    if (!store) {
      return baseResponse(res, false, 404, 'Store not found', null);
    }
    baseResponse(res, true, 200, 'Store retrieved successfully', store);
  } catch (error) {
    baseResponse(res, false, 500, 'Error getting store', null);
  }
}

exports.updateStore = async (req, res) => {
  if (!req.body.id || !req.body.name || !req.body.address) {
    return baseResponse(res, false, 400, 'ID, name, and address are required', null);
  }
  try {
    const updatedStore = await storeRepository.updateStore(req.body.id, req.body);
    if (!updatedStore) {
      return baseResponse(res, false, 404, 'Store not found', null);
    }
    baseResponse(res, true, 200, 'Store updated successfully', updatedStore);
  } catch (error) {
    baseResponse(res, false, 500, 'Error updating store', null);
  }
}

exports.deleteStore = async (req, res) => {
  try {
    const deletedStore = await storeRepository.deleteStore(req.params.id);
    if (!deletedStore) {
      return baseResponse(res, false, 404, 'Store not found', null);
    }
    baseResponse(res, true, 200, 'Store deleted successfully', deletedStore);
  } catch (error) {
    baseResponse(res, false, 500, 'Error deleting store', null);
  }
}