const FormData = require("form-data");
const stream = require("stream");
const axios = require("axios");
const itemRepository = require("../repository/item.repository");
const baseResponse = require("../utils/baseResponse.util");
const db = require('../database/pg.database');

exports.uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("Missing image file");
  }

  try {
    const formData = new FormData();
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);
    formData.append("file", bufferStream, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const uploadUrl = `${process.env.BASE_URL_ZIPLINE}/api/upload`;
    console.log("Upload URL:", uploadUrl);
    console.log("Authorization Token:", process.env.TOKEN_ZIPLINE);

    const imageResponse = await axios.post(
      uploadUrl,
      formData,
      {
        headers: {
          Authorization: `${process.env.TOKEN_ZIPLINE}`,
          ...formData.getHeaders()
        },
      }
    );

    if (imageResponse.data && imageResponse.data.url) {
      return imageResponse.data;
    } else {
      throw new Error("Invalid response from image upload service");
    }
  } catch (err) {
    console.error("Error uploading image:", err.message);
    throw err;
  }
};

exports.createItem = async (req, res) => {
  const { name, price, store_id, stock } = req.body;
  if (!name || !price || !store_id) {
    return baseResponse(res, false, 400, 'Name, price, and store_id are required', null);
  }

  try {
    const imageResponse = await this.uploadImage(req, res);
    const newItem = await itemRepository.createItem({
      name,
      price,
      store_id,
      image_url: imageResponse.url,
      stock
    });
    baseResponse(res, true, 201, 'Item created successfully', newItem);
  } catch (error) {
    baseResponse(res, false, 500, error.message, null);
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
    const {name, price, store_id, stock} = req.body;
    const image = req.file;
    try {
        const storeExists = await itemRepository.checkStoreExists(store_id);
        if (!storeExists) {
            return baseResponse(res, false, 404, "Store doesn't exist", null);
        }
        const item = await itemRepository.getItemsById(req.body.id);
        if (!item) {
            return baseResponse(res, false, 404, "Item not found", null);
        }
        const updatedItem = await itemRepository.updateItem({name, price, store_id, stock}, image);
        return baseResponse(res, true, 200, "Item updated", updatedItem);
    }
    catch (error) {
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

exports.checkStoreExists = async (store_id) => {
  try {
    const store = await db.query('SELECT * FROM stores WHERE id = $1', [store_id]);
    return store.rows.length > 0;
  } catch (error) {
    console.error('Error checking store existence', error);
  }
}

exports.createItem = async (item) => {
  try {
    const result = await db.query('INSERT INTO items (name, price, store_id, image_url, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *', 
      [item.name, item.price, item.store_id, item.image_url, item.stock]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating item', error);
    throw error;
  }
}

exports.getItems = async () => {
  try {
    const items = await db.query('SELECT * FROM items');
    return items.rows;
  } catch (error) {
    console.error('Error getting items', error);
  }
}

exports.getItemsById = async (id) => {
  try {
    const item = await db.query('SELECT * FROM items WHERE id = $1', [id]);
    return item.rows[0];
  } catch (error) {
    console.error('Error getting item by id', error);
  }
}

exports.getItemsByStoreId = async (store_id) => {
  try {
    const items = await db.query('SELECT * FROM items WHERE store_id = $1', [store_id]);
    return items.rows;
  } catch (error) {
    console.error('Error getting items by store id', error);
  }
}

exports.updateItem = async (item) => {
  try {
    const result = await db.query('UPDATE items SET name = $1, price = $2, store_id = $3, image_url = $4, stock = $5 WHERE id = $6 RETURNING *', 
      [item.name, item.price, item.store_id, item.image_url, item.stock, item.id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating item', error);
  }
}

exports.deleteItem = async (id) => {
  try {
    const result = await db.query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error deleting item', error);
  }
}

exports.updateItemStock = async (id, stock) => {
    try {
        const result = await db.query('UPDATE items SET stock = $1 WHERE id = $2 RETURNING *', [stock, id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error updating item stock', error);
        throw error;
    }
};
