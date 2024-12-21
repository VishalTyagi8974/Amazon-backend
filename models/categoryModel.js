const mongoose = require("mongoose");
const Product = require("./productModel");

const categorySchema = new mongoose.Schema({
    title: {
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

    image: {
        type: String,
        required: true
    },

    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }]
})
const Category = mongoose.model("Category", categorySchema);


module.exports = { Category, allCategories: categorySchema.path("title").enumValues }