const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const jwtVerification = require("../utils/jwtVerification");
const { signUpUser, logInUser, userProfileData, logOutUser, checkAuthStatus, updateCart, getCartData, updateCartItem, deleteCartItem, addAddress } = require("../controllers/userControllers");

router.route("/login")
    .post(wrapAsync(logInUser));

router.route("/signup")
    .post(signUpUser)

router.get('/auth/status', checkAuthStatus);

// Endpoint to log out
router.post('/logout', logOutUser);

router.route("/user")
    .get(jwtVerification, userProfileData)

router.route('/user/cart')
    .put(jwtVerification, updateCart)
    .post(jwtVerification, updateCartItem)
    .delete(jwtVerification, deleteCartItem)
    .get(jwtVerification, getCartData)

router.route('/user/addresses')
    .post(jwtVerification, addAddress)




module.exports = router