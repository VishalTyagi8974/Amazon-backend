const Product = require("../models/productModel");
const Review = require("../models/reviewModel");
const User = require("../models/userModel");

module.exports.getReviews = async (req, res, next) => {
    const page = parseInt(req.query.page);
    const { prodId } = req.params;
    const product = await Product.findById(prodId).populate({
        path: "reviews",
        sort: { createdAt: -1 },
        skip: ((page - 1) * 5),
        limit: 5
    })
    const sameProduct = await Product.findById(prodId);
    const totalPages = Math.ceil(sameProduct.reviews.length / 5);

    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }


    return res.status(200).json({ reviews: product.reviews, page, totalPages, avgRating: product.avgRating })
}

module.exports.postReview = async (req, res, next) => {
    const { body, rating, reviewer } = req.body;
    const { prodId } = req.params;
    const product = await Product.findById(prodId).populate("reviews");
    const newReview = new Review({ body, rating, reviewer });
    product.reviews.push(newReview);
    const avgRating = product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length;
    product.avgRating = Math.round(avgRating * 10) / 10
    await product.save();
    await newReview.save();
    res.status(200).json({ message: "Review Uploaded", avgRating: product.avgRating })
}
module.exports.deleteReview = async (req, res, next) => {
    const { review, prodId } = req.body; // Assuming review is passed from the frontend
    const userId = req.user.id;
    const user = await User.findById(userId);
    const product = await Product.findById(prodId).populate("reviews")

    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }


    if (user.username === review.reviewer) {
        product.reviews = product.reviews.filter(rev => rev._id.toString() !== review._id);
        if (product.reviews.length) {
            const avgRating = product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length;
            product.avgRating = Math.round(avgRating * 10) / 10
        } else {
            product.avgRating = 0;
        }
        await product.save();
        await Review.findByIdAndDelete(review._id);
        return res.status(200).json({ message: "Successfully deleted the review", avgRating: product.avgRating });
    } else {
        return res.status(403).json({ message: "Not authorized" });
    }
};


