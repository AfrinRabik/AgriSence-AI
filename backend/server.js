require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const farmRoutes = require('./routes/farmRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

// Initialize app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: '🌾 Farmer Portal is running!'
    });
});

// Root route - serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║  🌾 AI CROP RECOMMENDATION SYSTEM - SERVER        ║
╚═══════════════════════════════════════════════════╝

✅ Server running on http://localhost:${PORT}
📦 Database: MongoDB
🔐 Authentication: JWT
🎯 Features: Crop Recommendation, Farm Management

Available Endpoints:
  • POST   /api/auth/register
  • POST   /api/auth/login
  • POST   /api/auth/forgot-password
  • GET    /api/auth/me
  • PUT    /api/auth/update-profile
  
  • POST   /api/farms/create
  • GET    /api/farms
  • GET    /api/farms/:farmId
  • PUT    /api/farms/:farmId
  • DELETE /api/farms/:farmId
  
  • POST   /api/recommendations/get-recommendations
  • GET    /api/recommendations/history
  • GET    /api/recommendations/:recommendationId
  
  • GET    /api/health

Frontend: http://localhost:${PORT}
    `);
});

module.exports = app;
