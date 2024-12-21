const Order = require("../models/orderModel");
const User = require("../models/userModel");


module.exports.authenticateSeller = async (req, res, next) => {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (user && user.isSeller) {
        return next()
    }
    return res.status(400).json({ message: "You are not Seller" });
}


module.exports.authorizeSeller = async (req, res, next) => {
    const userId = req.user.id;
    const { sellerId } = req.body;
    const user = await User.findById(userId);
    if (user && user.isSeller) {
        if (sellerId !== user._id.toString()) {
            return res.status(400).json({ message: "Not Authrorized for this" });
        } else {
            return next()
        }
    }
    return res.status(400).json({ message: "You are not Seller" });
}


module.exports.authorizeOrderSeller = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;

        // Fetch only the seller field
        const order = await Order.findById(orderId).select("seller");
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.seller.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to access this order as a seller." });
        }

        return next();
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports.authorizeOrderBuyer = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;

        // Fetch only the buyer field
        const order = await Order.findById(orderId).select("buyer");
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.buyer.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to access this order as a buyer." });
        }

        return next();
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports.authorizeOrderSellerOrBuyer = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;
        // Fetch seller and buyer fields
        const order = await Order.findById(orderId).select("seller buyer");
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (
            order.seller.toString() !== userId &&
            order.buyer.toString() !== userId
        ) {
            return res.status(403).json({
                message: "You are neither the seller nor the buyer of this order.",
            });
        }


        return next();
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
