const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();

// Connect to Database
connectDB();

// Middleware
// Dynamic CORS configuration for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Define a simple route
app.get('/', (req, res) => {
  res.send('Smart GatePass API is running...');
});

// Routes (to be added later)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/gatepass', require('./routes/gatepass'));
app.use('/api/security', require('./routes/security'));
app.use('/api/student', require('./routes/student'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
