const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema({
    body: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    reviewer: {
        type: String,
        required: true
    }
})

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;