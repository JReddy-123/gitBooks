import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

// Import routes
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Development logging
if (process.env.NODE_ENV === 'development') {
    const morganModule = await import('morgan');
    const morgan = morganModule.default;
    app.use(morgan('dev'));
}

// Basic security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (Sprint 1: Only users)
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Sprint 1 - User API ready!',
        sprint: 1
    });
});

// 404 handler
app.use((req, res, next) => {
    const err = new Error('Endpoint not found');
    err.status = 404;
    next(err);
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Error:', error.stack);
    
    if (!error.status) {
        error.status = 500;
        error.message = 'Internal Server Error';
    }
    
    res.status(error.status).json({
        success: false,
        message: error.message
    });
});

// Start server (like your blog-api)
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Sprint 1 Server running on port ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
        console.log(`User API: http://localhost:${PORT}/api/users/`);
    });
}

export default app;