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

        const page = parseInt(req.query.page);

        const { category, pricing, rating } = req.query;

        const cat = replaceDashesWithSpaces(category);

        // Fetch the category and populate products
        const foundCategory = await Category.findOne({ title: cat }).populate({
            path: "products",
            sort: { createdAt: -1 },
            skip: ((page - 1) * 7),
            limit: 7
        });

        if (!foundCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        const sameCat = await Category.findOne({ title: cat });
        const totalPages = Math.ceil(sameCat.products.length / 7);


        // Check if the category was found


        // Sort the products based on pricing if specified
        if (pricing === "Low-High") {
            foundCategory.products.sort((a, b) => a.price - b.price);
        } else if (pricing === "High-Low") {
            foundCategory.products.sort((a, b) => b.price - a.price);
        } else if (rating === "High-Low") {
            foundCategory.products.sort((a, b) => b.avgRating - a.avgRating); // Fix: Use a comparison function for avgRating

        }

        // Send the sorted products
        return res.status(200).json({ products: foundCategory.products, totalPages, page });

    } catch (error) {
        // Pass any errors to the error-handling middleware
        next(error);
    }
};


module.exports.searchSearchedProducts = async (req, res, next) => {
    try {
        const { pricing = "Default", query, rating = "Default", page = 1, limit = 7 } = req.query;
        const regex = new RegExp(query, 'i'); // Case-insensitive search for the query
        const skip = (page - 1) * limit; // Calculate how many documents to skip

        // Fetch and sort data based on pricing or rating
        const productsQuery = Product.find({ name: regex });

        if (pricing === "Low-High") {
            productsQuery.sort({ price: 1 }); // Ascending price
        } else if (pricing === "High-Low") {
            productsQuery.sort({ price: -1 }); // Descending price
        } else if (rating === "High-Low") {
            productsQuery.sort({ avgRating: -1 }); // Descending rating
        }

        // Apply pagination
        const totalProducts = await Product.countDocuments({ name: regex }); // Get total product count
        const foundProducts = await productsQuery.skip(skip).limit(parseInt(limit)); // Apply skip and limit

        // Return filtered and paginated results
        return res.status(200).json({
            products: foundProducts,
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: parseInt(page),
        });
    } catch (err) {
        next(err);
    }
};


module.exports.getProductWithId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const productData = await Product.findById(id)

        const productSeller = await User.findById(productData.seller.toString())

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
