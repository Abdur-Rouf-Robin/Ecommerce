import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';


// Load environment variables
dotenv.config();

// Initialize the app
const app = express();

// File and directory utilities
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware setup
app.use(helmet()); // Security headers
app.use(cors(
    {
        origin: 'http://localhost:5173/',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Authorization', 'Accept', 'Cache-Control', 'Expires', 'Pragma'],
    }
)); // Cross-Origin Resource Sharing
app.use(xss()); // Prevent XSS attacks
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(hpp(undefined)); // Prevent HTTP Parameter Pollution
if (process.env.NODE_ENV === 'production') {
    app.use(compression());
}

// Rate limiting for global requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies
app.use(fileUpload(undefined)); // Handle file uploads


// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Documentation

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Example routes

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
