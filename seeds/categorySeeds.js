const { Category } = require("../models/categoryModel.js");
const categoryData = require("./categoryData");
const mongoose = require("mongoose");
// if (process.env.NODE_ENV !== "production") {
//     require("dotenv").config()
// }

// const dbUrl = process.env.DB_URL;
mongoose.connect("")
    .then(() => console.log("Connected to MDB"))
    .catch((err) => console.log(err));



async function seedCategories() {
    await Category.deleteMany({})
    for (let cat of categoryData) {
        const newCat = new Category({
            title: cat.title,
            image: cat.url,
            products: []
        })

        await newCat.save();
    }
}

seedCategories().then(() => {
    mongoose.connection.close();
})