import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to database and start server
const startServer = async () => {
    try {
        await connectDB();
        
        app.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════════════╗
║    🍎 SmartAI Nutrition API Server Running    ║
╠════════════════════════════════════════════════╣
║  🌐 Port: ${PORT}                                 ║
║  📦 Environment: ${process.env.NODE_ENV || 'development'}               ║
║  🔗 Health: http://localhost:${PORT}/api/health  ║
╚════════════════════════════════════════════════╝
            `);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err.message);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    process.exit(1);
});
