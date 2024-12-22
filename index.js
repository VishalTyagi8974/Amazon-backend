const express = require("express");
const mongoose = require("mongoose");
const productRoutes = require("./routes/productRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const User = require("./models/userModel");

// Use Helmet to enhance security with a set of default HTTP headers
const app = express();
app.use(helmet());

// Enable CORS for all origins and routes
app.use(cors({
    origin: '*', // Allow all origins
}));

// Use rate limiting to prevent DoS attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: 'Too many requests, please try again later.'
});
app.use(limiter);

// Sanitize incoming data to prevent NoSQL injection
app.use(mongoSanitize());

// Use cookie-parser middleware
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport middleware for authentication
passport.use(User.createStrategy());

// Connect to MongoDB
const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl)
    .then(() => console.log("Connected to MDB"))
    .catch((err) => console.log(err));

// Routes
app.use("/products/:prodId/reviews", reviewRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/", userRoutes);

// Error handling middleware
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

