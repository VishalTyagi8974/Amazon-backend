const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const User = require("./models/userModel");

// Import Routes
const productRoutes = require("./routes/productRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Configure CORS
const corsOptions = {
    origin: '*', // Replace with specific domains for production, e.g., ["https://example.com"]
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true, // Set to true if cookies or authentication are required across origins
};
app.use(cors(corsOptions));

// Configure Helmet
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP if CORS requires dynamic content
    crossOriginEmbedderPolicy: false, // Allow embedding resources from other origins
}));

// Apply rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests
    message: "Too many requests, please try again later.",
});
app.use(limiter);

// Sanitize incoming data
app.use(mongoSanitize());

// Middleware to parse cookies
app.use(cookieParser());

// Middleware to parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport.js
passport.use(User.createStrategy());

// Connect to MongoDB
const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Database connection error:", err));

// Define Routes
app.use("/products/:prodId/reviews", reviewRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/", userRoutes);

// Use error handling middleware
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;


