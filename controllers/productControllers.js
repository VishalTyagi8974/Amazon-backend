const { Category, allCategories } = require("../models/categoryModel");
const User = require("../models/userModel");
const replaceDashesWithSpaces = require("../utils/replaceDashesWithSpaces");
const Product = require("../models/productModel");
const { cloudinary } = require("../cloudinary");

module.exports.randomCategories = async (req, res) => {
    const getRandom = () => Math.floor(Math.random() * allCategories.length);
    const randomIndexs = [];
    while (randomIndexs.length < 5) {
        const ind = getRandom();
        if (!randomIndexs.includes(ind)) {
            randomIndexs.push(ind)
        }
    }

    const finalCats = await Promise.all(
        randomIndexs.map((ind) => Category.findOne({ title: allCategories[ind] }))
    );
    return res.status(200).json({ list: finalCats });
}


module.exports.searchCategoryProducts = async (req, res, next) => {
    try {
        const { category, pricing, rating } = req.query;
        const cat = replaceDashesWithSpaces(category);

        // Fetch the category and populate products
        const foundCategory = await Category.findOne({ title: cat }).populate("products");

        // Check if the category was found
        if (!foundCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Sort the products based on pricing if specified
        if (pricing === "Low-High") {
            foundCategory.products.sort((a, b) => a.price - b.price);
        } else if (pricing === "High-Low") {
            foundCategory.products.sort((a, b) => b.price - a.price);
        } else if (rating === "High-Low") {
            foundCategory.products.sort((a, b) => b.avgRating - a.avgRating); // Fix: Use a comparison function for avgRating

        }

        // Send the sorted products
        return res.status(200).json({ products: foundCategory.products });

    } catch (error) {
        // Pass any errors to the error-handling middleware
        next(error);
    }
};


module.exports.searchSearchedProducts = async (req, res, next) => {
    const { pricing = "Default", query, rating = "Default" } = req.query;
    const regex = new RegExp(query, 'i');

    const foundProducts = await Product.find({ name: regex })

    if (pricing === "Low-High") {
        foundProducts.sort((a, b) => a.price - b.price);
    } else if (pricing === "High-Low") {
        foundProducts.sort((a, b) => b.price - a.price);
    } else if (rating === "High-Low") {
        foundProducts.sort((a, b) => b.avgRating - a.avgRating); // Fix: Use a comparison function for avgRating

    }

    return res.status(200).json({ products: foundProducts });



};

module.exports.getProductWithId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const productData = await Product.findById(id)
        const productSeller = await User.findById(productData.seller)
        return res.status(200).json({ productSeller, productData })
    } catch (error) {
        console.log(error.message)
        next(error)
    }

};

module.exports.editProduct = async (req, res, next) => {
    try {
        const { name, price, description, category, prodId } = req.body;
        const deleteImages = JSON.parse(req.body.deleteImages);



        const product = await Product.findById(prodId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Update product fields
        product.name = name;
        product.price = price;
        product.description = description;
        product.category = category;

        // Filter out images to keep and delete from Cloudinary
        const newArray = [];
        console.log(newArray);
        console.log(product.images)
        console.log(deleteImages)

        for (let image of product.images) {
            if (deleteImages.includes(image.filename)) {
                console.log(image)
                await cloudinary.uploader.destroy(image.filename, { resource_type: "image" });
            } else {
                newArray.push(image);
            }
        }
        product.images = newArray;
        console.log(newArray);


        // Add new images uploaded via `req.files`
        for (let img of req.files) {
            product.images.push({
                filename: img.filename,
                url: img.path,
            });
        }

        await product.save();
        res.status(200).json({ message: "Product updated successfully", productId: product._id });
    } catch (err) {
        next(err); // Pass errors to error handler middleware
    }
};


module.exports.deleteProduct = async (req, res, next) => {
    const { prodId } = req.body;
    await Product.findByIdAndDelete(prodId);
    res.status(200).json({ message: "Successfully deleted the product" });
}

module.exports.createProduct = async (req, res, next) => {
    const product = { ...req.body };
    const newProduct = new Product(product);
    newProduct.images = req.files.map(f => ({ filename: f.filename, url: f.path }))
    newProduct.seller = req.user.id;
    await newProduct.save();
    const cat = await Category.findOne({ title: newProduct.category });
    cat.products.push(newProduct);
    await cat.save();
    res.status(200).json({ productId: newProduct._id });
}
