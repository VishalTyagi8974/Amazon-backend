const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const { getReviews, postReview, deleteReview } = require("../controllers/reviewControllers");
const jwtVerification = require("../utils/jwtVerification");


router.route("/")
    .get(wrapAsync(getReviews))
    .post(wrapAsync(postReview))
    .delete(jwtVerification, wrapAsync(deleteReview))


module.exports = router
