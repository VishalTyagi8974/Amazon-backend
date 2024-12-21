const { Category } = require("../models/categoryModel.js");
const Product = require("../models/productModel");
const productData = require("./productData.js");
const mongoose = require("mongoose");

// if (process.env.NODE_ENV !== "production") {
//     require("dotenv").config()
// }

// const dbUrl = process.env.DB_URL;

mongoose.connect("")
    .then(() => console.log("Connected to MDB"))
    .catch((err) => console.log(err));

async function seedProducts() {
    await Product.deleteMany({})

    for (let prod of productData) {
        const newProd = new Product({
            name: prod.name,
            images: [{ url: "https://res.cloudinary.com/dtgebpxfb/image/upload/v1734681277/Amazon/defaultProd_qb2fuh.png", filename: "filename" }],
            description: prod.description,
            price: prod.price,
            inStock: true,
            category: prod.category,
            seller: '6764083eadc1022e4f564bab'
        })
        await newProd.save();
        const cat = await Category.findOne({ title: prod.category })
        cat.products.push(newProd)
        await cat.save();
    }
}

seedProducts().then(() => {
    mongoose.connection.close();
})