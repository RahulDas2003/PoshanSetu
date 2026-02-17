import ApiError from '../utils/ApiError.js';

const errorHandler = (err, req, res, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        error = new ApiError(statusCode, message, [], error.stack);
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        error = new ApiError(404, `Resource not found. Invalid: ${err.path}`);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        error = new ApiError(400, `Duplicate field value entered: ${Object.keys(err.keyValue).join(', ')}`);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new ApiError(400, message);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = new ApiError(401, 'Invalid token. Please log in again.');
    }

    if (err.name === 'TokenExpiredError') {
        error = new ApiError(401, 'Token expired. Please log in again.');
    }

    const response = {
        success: false,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    };

    console.error(`❌ Error: ${error.message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error(error.stack);
    }

    res.status(error.statusCode).json(response);
};

export default errorHandler;
