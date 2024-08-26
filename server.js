import express from 'express';

// Create express app
const app = express();

// Test route
app.get(`/hello`, (req, res) => {
    res.json('Hello world')
})

// Start development server
app.listen(8000, () => {
    console.log(`Server listening on port 8000`);
})