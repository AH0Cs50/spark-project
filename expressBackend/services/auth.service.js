// services/auth.service.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import UserService from './user.service.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRE_IN || '1h';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret';
const REFRESH_EXPIRES_IN = '7d';

// Optional: store revoked tokens
const revokedTokens = new Set();

const AuthService = {

  // --- Sign in / login ---
  async signIn({ email, password }) {
    const user = await UserService.getUserByEmail(email);
    if (!user) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401, name:'AuthError'});
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401, name:'AuthError'});

    const accessToken = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ _id: user._id }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
    
    const {_id,name}=user;
    return { userData:{_id,name,"user email":email}, accessToken, refreshToken };
  },

  // --- Logout ---
  logout(refreshToken) {
    revokedTokens.add(refreshToken);
    return true;
  },

  // --- Verify access token ---
  verifyAccessToken(token) {
    if (!token) return null;
    if (revokedTokens.has(token)) return null;

    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') return null;
      throw err;
    }
  },

  // --- Refresh access token ---
  refreshAccessToken(refreshToken) {
    if (revokedTokens.has(refreshToken)) {
      throw Object.assign(new Error('Refresh token revoked'), { statusCode: 401 });
    }
    try {
      const payload = jwt.verify(refreshToken, REFRESH_SECRET);
      const newAccessToken = jwt.sign({ _id: payload._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      return newAccessToken;
    } catch (err) {
      throw Object.assign(new Error('Refresh token invalid or expired'), { statusCode: 401 });
    }
  }
};

export default AuthService;
