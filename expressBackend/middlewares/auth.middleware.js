// middleware/auth.middleware.js
import  AuthService  from '../services/auth.service.js';

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) throw Object.assign(new Error('No token provided'), { statusCode: 401, name:'AuthError'});

    const token = authHeader.split(' ')[1];
    const payload = AuthService.verifyAccessToken(token);
    
    if (!payload) throw Object.assign(new Error('Token expired or invalid'), { statusCode: 401 ,name:'AuthError'});
    
    req.user = payload;//set use info
    next(); //move to next middleware or route(protected)
  } catch (err) {
    //if coming error from here or from upper middleware or routers also come until reach error handler
    next(err);
  }
}