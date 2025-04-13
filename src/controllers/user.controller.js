const bcrypt = require('bcrypt');
const userRepository = require('../repository/user.repository');
const baseResponse = require('../utils/baseResponse.util');

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userRepository.getAllUsers();
    baseResponse(res, true, 200, 'Users retrieved successfully', users);
  } catch (error) {
    baseResponse(res, false, 500, 'Error getting users', null);
  }
}

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.query;
  if (!name || !email || !password) {
    return baseResponse(res, false, 400, 'Name, email, and password are required', null);
  }
  if (!emailRegex.test(email)) {
    return baseResponse(res, false, 400, 'Invalid email format', null);
  }
  if (!passwordRegex.test(password)) {
    return baseResponse(res, false, 400, 'Password must be at least 8 characters long and include at least one number and one special character', null);
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userRepository.createUser({ name, email, password: hashedPassword });
    baseResponse(res, true, 201, 'User created successfully', newUser);
  } catch (error) {
    baseResponse(res, false, 500, error.message, null);
  }
}

exports.loginUser = async (req, res) => {
  const { email, password } = req.query;
  if (!email || !password) {
    return baseResponse(res, false, 400, 'Email and password are required', null);
  }
  try {
    const user = await userRepository.getUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return baseResponse(res, false, 401, 'Invalid email or password', null);
    }
    baseResponse(res, true, 200, 'Login success', user);
  } catch (error) {
    baseResponse(res, false, 500, error.message, null);
  }
}

exports.getUser = async (req, res) => {
  try {
    const user = await userRepository.getUser(req.params.id);
    if (!user) {
      return baseResponse(res, false, 404, 'User not found', null);
    }
    baseResponse(res, true, 200, 'User retrieved successfully', user);
  } catch (error) {
    baseResponse(res, false, 500, 'Error getting user', null);
  }
}

exports.getUserByEmail = async (req, res) => {
  try {
    const user = await userRepository.getUserByEmail(req.params.email);
    if (!user) {
      return baseResponse(res, false, 404, 'User not found', null);
    }
    baseResponse(res, true, 200, 'User found', user);
  } catch (error) {
    baseResponse(res, false, 500, 'Error getting user', null);
  }
}

exports.updateUser = async (req, res) => {
  const { id, name, email, password } = req.body;
  if (!id || !name || !email) {
    return baseResponse(res, false, 400, 'ID, name, and email are required', null);
  }
  if (email && !emailRegex.test(email)) {
    return baseResponse(res, false, 400, 'Invalid email format', null);
  }
  if (password && !passwordRegex.test(password)) {
    return baseResponse(res, false, 400, 'Password must be at least 8 characters long and include at least one number and one special character', null);
  }
  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    const updatedUser = await userRepository.updateUser(id, { name, email, password: hashedPassword });
    if (!updatedUser) {
      return baseResponse(res, false, 404, 'User not found', null);
    }
    baseResponse(res, true, 200, 'User updated successfully', updatedUser);
  } catch (error) {
    baseResponse(res, false, 500, 'Error updating user', null);
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await userRepository.deleteUser(req.params.id);
    if (!deletedUser) {
      return baseResponse(res, false, 404, 'User not found', null);
    }
    baseResponse(res, true, 200, 'User deleted successfully', deletedUser);
  } catch (error) {
    baseResponse(res, false, 500, 'Error deleting user', null);
  }
}

exports.topUp = async (req, res) => {
  const { id, amount } = req.query;
  if (!id || !amount || amount <= 0) {
    return baseResponse(res, false, 400, 'ID and amount are required, and amount must be larger than 0', null);
  }
  try {
    const user = await userRepository.getUser(id);
    if (!user) {
      return baseResponse(res, false, 404, 'User not found', null);
    }
    const updatedBalance = user.balance + parseInt(amount);
    const updatedUser = await userRepository.updateUserBalance(id, updatedBalance);
    baseResponse(res, true, 200, 'Top up successful', updatedUser);
  } catch (error) {
    baseResponse(res, false, 500, 'Error topping up balance', null);
  }
}