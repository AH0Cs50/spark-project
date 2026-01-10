// services/user.service.js
import bcrypt from 'bcryptjs';

import UserModel from '../model/user.model.js';

const SALT_ROUNDS = 10;

const UserService = {
    
  // --- Create user (signup) ---
  async createUser({ name, email, password }) {
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      const err = new Error('Email already in use');
      err.name='UserErorr';
      err.statusCode = 409;
      throw err;
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await UserModel.create({ name, email, passwordHash });
    return user;
  },

  //for use in this serivce and other services
  async getUserByEmail(email) {
    return UserModel.findByEmail(email);
  },

  async getUserById(id) {
    return UserModel.findById(id);
  }
};

export default UserService;