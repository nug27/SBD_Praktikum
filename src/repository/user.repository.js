const db = require('../database/pg.database');

exports.getAllUsers = async () => {
  try {
    const users = await db.query('SELECT * FROM users');
    return users.rows;
  } catch (error) {
    console.error('Error getting users', error);
  }
}

exports.createUser = async (user) => {
  try {
    const result = await db.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *', [user.name, user.email, user.password]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user', error);
  }
}

exports.getUser = async (id) => {
  try {
    const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return user.rows[0];
  } catch (error) {
    console.error('Error getting user', error);
  }
}

exports.getUserByEmail = async (email) => {
  try {
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return user.rows[0];
  } catch (error) {
    console.error('Error getting user by email', error);
  }
}

exports.updateUser = async (id, user) => {
  try {
    const result = await db.query('UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4 RETURNING *', [user.name, user.email, user.password, id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating user', error);
  }
}

exports.deleteUser = async (id) => {
  try {
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error deleting user', error);
  }
}

exports.updateUserBalance = async (id, balance) => {
  try {
    const result = await db.query('UPDATE users SET balance = $1 WHERE id = $2 RETURNING *', [balance, id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating user balance', error);
    throw error;
  }
}