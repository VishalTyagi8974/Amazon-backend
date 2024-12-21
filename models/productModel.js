
const mongoose = require("mongoose");
const Review = require("./reviewModel");
const User = require("./userModel");
const { cloudinary } = require("../cloudinary");


const imageSchema = new mongoose.Schema({
    filename: String,
    url: String
})

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    description: {
        type: String,
        required: true
    },

    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }],

    category: {
        type: String,
        enum: [
            "Electronics",
            "Books",
            "Clothing, Shoes & Jewelry",
            "Home & Kitchen",
            "Beauty & Personal Care",
            "Sports & Outdoors",
            "Toys & Games",
            "Grocery & Gourmet Food",
            "Health & Household",
            "Automotive",
            "Baby",
            "Industrial & Scientific",
            "Pet Supplies",
            "Tools & Home Improvement",
            "Office Products",
            "Arts, Crafts & Sewing",
            "Music, CDs & Vinyl",
            "Movies & TV",
            "Video Games",
            "Software"
        ],
        required: true
    },
    avgRating: {
        type: Number,
        default: 0
    },

    images: [imageSchema],

})

productSchema.post("findOneAndDelete", async function (product) {
    if (product) {
        await Review.deleteMany({ _id: { $in: product.reviews } });

        if (product.images?.length) {
            for (let image of product.images) {
                if (image.filename) {
                    await cloudinary.uploader.destroy(image.filename, { resource_type: 'image' });
                }
            }
        }

    }
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;