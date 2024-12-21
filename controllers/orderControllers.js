const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const calculateDeliveryTime = require("../utils/calculateDeliveryTime");


module.exports.placeOrder = async (req, res) => {
    const { items, address } = req.body;
    const userId = req.user.id;

    try {
        const [long1, lat1] = address.geometry.coordinates;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        for (let item of items) {
            const product = await Product.findById(item.productId).populate("seller");

            if (!product) {
                return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
            }

            const sellerAddress = product.seller.addresses[0];
            const seller = await User.findById(product.seller);

            if (!seller) {
                return res.status(404).json({ message: "Seller not found" });
            }

            const [long2, lat2] = sellerAddress.geometry.coordinates;
            const { estimatedDeliveryDate } = calculateDeliveryTime(lat1, long1, lat2, long2);

            // Create the order
            const newOrder = new Order({
                estimatedDeliveryDate,
                sellerAddress,
                deliveryAddress: address,
                name: product.name,
                price: product.price * item.quantity,
                quantity: item.quantity,
                image: product.images[0],
                seller: product.seller._id,
                buyer: user._id
            });

            await newOrder.save();

            // Update user and seller models
            user.orders.push(newOrder);
            seller.soldProducts.push(newOrder);

            await user.save();
            await seller.save();
        }

        return res.status(200).json({ message: "Orders placed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occurred while placing the order" });
    }
};



module.exports.retriveOrders = async (req, res) => {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("orders");
    return res.status(200).json({ orders: user.orders });

}

module.exports.retriveSoldProducts = async (req, res) => {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("soldProducts");
    return res.status(200).json({ soldProducts: user.soldProducts });

}


module.exports.findOrder = async (req, res) => {
    const userId = req.user.id;
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (order) {
        return res.status(200).json({ order, isSeller: userId === order.seller.toString() });
    }
    return res.status(400).json({ message: "Order Not Found" });

}

module.exports.cancelOrder = async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).json({ error: "Order not found" });
    }

    if (order.orderStatus !== "Pending") {
        return res.status(400).json({ error: "Only pending orders can be cancelled" });
    }

    order.orderStatus = "Cancelled";
    await order.save();

    res.status(200).json({ message: "Order cancelled successfully", order });

};

module.exports.markAsDelivered = async (req, res) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).json({ error: "Order not found" });
    }

    if (order.orderStatus !== "Shipped") {
        return res.status(400).json({ error: "Only shipped orders can be marked as delivered" });
    }

    order.orderStatus = "Delivered";
    await order.save();

    res.status(200).json({ message: "Order marked as delivered", order });

};

module.exports.returnOrder = async (req, res) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).json({ error: "Order not found" });
    }

    if (order.orderStatus !== "Delivered") {
        return res.status(400).json({ error: "Only delivered orders can be returned" });
    }

    order.orderStatus = "Returned";
    await order.save();

    res.status(200).json({ message: "Return request processed", order });

};

module.exports.markAsShipped = async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).json({ error: "Order not found" });
    }

    if (order.orderStatus !== "Pending") {
        return res.status(400).json({ error: "Only pending orders can be marked as shipped" });
    }

    order.orderStatus = "Shipped";
    await order.save();

    res.status(200).json({ message: "Order marked as shipped", order });

};