const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { placeOrder, cancelOrder, markAsDelivered, returnOrder, markAsShipped, retriveOrders, findOrder, retriveSoldProducts } = require("../controllers/orderControllers");
const jwtVerification = require("../utils/jwtVerification");
const { authorizeOrderBuyer, authorizeOrderSeller, authorizeOrderSellerOrBuyer, authenticateSeller } = require("../utils/sellerAuth");

router.route("/")
    .post(jwtVerification, wrapAsync(placeOrder))
    .get(jwtVerification, wrapAsync(retriveOrders))

router.get("/soldProducts", jwtVerification, authenticateSeller, wrapAsync(retriveSoldProducts));

router.get("/:orderId", jwtVerification, authorizeOrderSellerOrBuyer, wrapAsync(findOrder));

router.patch("/:orderId/cancel", jwtVerification, authorizeOrderSellerOrBuyer, wrapAsync(cancelOrder));

router.patch("/:orderId/ship", jwtVerification, authorizeOrderSeller, wrapAsync(markAsShipped));

router.patch("/:orderId/deliver", jwtVerification, authorizeOrderBuyer, wrapAsync(markAsDelivered));

router.patch("/:orderId/return", jwtVerification, authorizeOrderBuyer, wrapAsync(returnOrder));

module.exports = router;
