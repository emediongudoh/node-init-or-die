import express from 'express';
import dotenv from 'dotenv';

// Create express app
const app = express();

// Load env variables
dotenv.config();

const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV;

// Test route
app.get(`/hello`, (req, res) => {
    res.json('Hello world');
});

// Start development server
app.listen(8000, () => {
    console.log(`${NODE_ENV} server listening on port ${PORT}`);
});
