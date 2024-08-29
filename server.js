import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import mongoose from 'mongoose';

// Config imports
import logger from './configs/logger.config.js';

// Create express app
const app = express();

// Load env variables
dotenv.config();

const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV;
const DATABASE_URL = process.env.DATABASE_URL;

// Connect to MongoDB atlas
mongoose
    .connect(DATABASE_URL)
    .then(() =>
        logger.info(`Database connected successfully -> ${DATABASE_URL}`)
    );

// Terminate server on MongoDB error
mongoose.connection.on('error', err => {
    logger.error(`Database connection failed -> ${err.message}`);
    process.exit(1);
});

// HTTP request logger middleware for node.js
if (NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Secure express apps by setting HTTP response headers
app.use(helmet());

// Parse incoming JSON request body
app.use(express.json());

// Parse incoming JSON request url
app.use(express.urlencoded({ extended: true }));

// Sanitize user-supplied data to prevent MongoDB operator injection
app.use(mongoSanitize());

// Parse HTTP request cookies
app.use(cookieParser());

// Node.js compression middleware
app.use(compression());

// Express file upload middleware that wraps around `Busboy`
app.use(fileUpload({ useTempFiles: true }));

// Node.js CORS middleware
app.use(
    cors({
        origin: `http://localhost:5173`,
    })
);

// Test route
app.get(`/hello`, (req, res) => {
    res.json(req.body);
});

// Start development server
let server = app.listen(PORT, () => {
    logger.info(`${NODE_ENV} server listening on port ${PORT}`);
});

// Catch all incoming 404 Not Found error
app.use(async (req, res, next) => {
    next(
        createHttpError.NotFound(
            'The requested resource could not be found on this server'
        )
    );
});

// Handle HTTP errors
app.use(async (err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        error: {
            status: err.status || 500,
            message: err.message,
        },
    });
});

// Terminate server on error
const exitHandler = () => {
    if (server) {
        logger.info(`Terminate the ${NODE_ENV} server on port ${PORT}`);
        process.exit(1);
    } else {
        process.exit(1);
    }
};

// Handle unexpected error
const unexpectedErrorHandler = err => {
    logger.error(err);
    exitHandler();
};

// Listen for server error logs
process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

// Terminate server gracefully -> LINUX machine
process.on('SIGTERM', () => {
    if (server) {
        logger.info(`Terminate the ${NODE_ENV} server on port ${PORT}`);
        process.exit(1);
    }
});
