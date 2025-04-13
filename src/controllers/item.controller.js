const itemRepository = require("../repository/item.repository");
const baseResponse = require("../utils/baseResponse.util");
const cloudinary = require('cloudinary').v2;

exports.createItem = async (req, res) => {
    const {name, price, store_id, stock} = req.body;
    const image = req.file;
    try {
        const storeExists = await itemRepository.checkStoreExists(store_id);
        if (!storeExists) {
            return baseResponse(res, false, 404, "Store doesn't exist", null);
        }

        let imageUrl = null;
        if (image) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
                uploadStream.end(image.buffer);
            });
            imageUrl = result.secure_url;
        }

        const newItem = await itemRepository.createItem({name, price, store_id, stock, image_url: imageUrl});
        return baseResponse(res, true, 201, "Item created", newItem);
    } catch (error) {
        console.error("Error creating item:", error);
        return baseResponse(res, false, 500, "Error creating item", error);
    }
};

exports.getItems = async (req, res) => {
    try {
        const items = await itemRepository.getItems();
        return baseResponse(res, true, 200, "Items found", items);
    } catch (error) {
        return baseResponse(res, false, 500, "Error retrieving items", error);
    }
};

exports.getItemsById = async (req, res) => {
    try {
        const items = await itemRepository.getItemsById(req.params.id);
        if (!items) {
            return baseResponse(res, false, 404, "Item not found", null);
        }
        return baseResponse(res, true, 200, "Items found", items);
    } catch (error) {
        return baseResponse(res, false, 500, "Error retrieving items", error);
    }
};

exports.getItemsByStoreId = async (req, res) => {
    try {
        const items = await itemRepository.getItemsByStoreId(req.params.store_id);
        if (!items) {
            return baseResponse(res, false, 404, "Store doesnt Exist", null);
        }
        return baseResponse(res, true, 200, "Items found", items);
    } catch (error) {
        return baseResponse(res, false, 500, "Error retrieving items", error);
    }
};

exports.updateItem = async (req, res) => {
    const {id, name, price, store_id, stock} = req.body;
    const image = req.file;
    try {
        const storeExists = await itemRepository.checkStoreExists(store_id);
        if (!storeExists) {
            return baseResponse(res, false, 404, "Store doesn't exist", null);
        }
        const item = await itemRepository.getItemsById(id);
        if (!item) {
            return baseResponse(res, false, 404, "Item not found", null);
        }

        let imageUrl = item.image_url;
        if (image) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
                uploadStream.end(image.buffer);
            });
            imageUrl = result.secure_url;
        }

        const updatedItem = await itemRepository.updateItem({id, name, price, store_id, stock, image_url: imageUrl});
        return baseResponse(res, true, 200, "Item updated", updatedItem);
    }
    catch (error) {
        console.error("Error updating item:", error);
        return baseResponse(res, false, 500, "Error updating item", error);
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const item = await itemRepository.getItemsById(req.params.id);
        if (!item) {
            return baseResponse(res, false, 404, "Item not found", null);
        }
        await itemRepository.deleteItem(req.params.id);
        return baseResponse(res, true, 200, "Item deleted", item);
    } catch (error) {
        return baseResponse(res, false, 500, "Error deleting item", error);
    }
};
