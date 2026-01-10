// middleware/error.middleware.js

export function errorHandler(err, req, res, next) {
    
  
    // Default error response
    let name=err.name||'error';
    let statusCode = err.code || 500;
    let message = err.message|| 'Internal Server Error';
    let details = null;
  
    // --- Model/Validation Errors ---
    if (err.name === 'ValidationError' || err.details) {
      statusCode = 400;
      message = err.message || 'Validation Error';
      details = err.details || [err.message];
    }

    // --- Service/User Errors ---
    if(err.name==='UserErorr'|| err.details) {
        message = err.message || 'User Error';
        details = err.details || [err.message];
    }
  
    // --- Custom App Errors ---
    // Example: NotFoundError, UnauthorizedError
    if (err.statusCode && err.message) {
      statusCode = err.statusCode;
      message = err.message;
      details = err.details || null;
    }
  
    // --- Mongoose/Nedb errors ---
    if (err.code === 11000) { // duplicate key error in Mongo/Mongoose
      statusCode = 409;
      message = 'Duplicate key error';
      details = err.keyValue;
    }
  
    //Error Response structure
    res.status(statusCode).json({
      success: false,
      name,
      message,
      details
    });
  }