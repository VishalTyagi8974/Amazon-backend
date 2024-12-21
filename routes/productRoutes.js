const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { randomCategories, searchCategoryProducts, searchSearchedProducts, getProductWithId, createProduct, editProduct, deleteProduct } = require("../controllers/productControllers");
const { allCategories } = require("../models/categoryModel");
const { authenticateSeller, authorizeSeller } = require("../utils/sellerAuth.js");
const jwtVerification = require("../utils/jwtVerification");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });



router.route("/")
    .post(jwtVerification, authenticateSeller, upload.array("images"), wrapAsync(createProduct))
    .delete(jwtVerification, authorizeSeller, wrapAsync(deleteProduct))
    .patch(jwtVerification, upload.array("images"), authorizeSeller, wrapAsync(editProduct));

router.route("/randomcategories")
    .get(wrapAsync(randomCategories));

router.route("/search")
    .get(wrapAsync(searchSearchedProducts));

router.get("/allcategories", wrapAsync((req, res) => {
    return res.status(200).json({ allCategories });
}))

router.get("/categories", wrapAsync(searchCategoryProducts))
router.get("/:id", getProductWithId)

module.exports = router
