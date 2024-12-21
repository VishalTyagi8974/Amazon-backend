const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    image: {
        filename: String,
        url: String
    },

    deliveryAddress: {
        location: {
            type: String,
            required: true
        },

        geometry: {
            type: {
                type: String,
                enum: ["Point"],
                required: true
            },
            coordinates: {
                type: [Number],
                required: true
            }
        }
    },

    sellerAddress: {
        location: {
            type: String,
            required: true
        },

        geometry: {
            type: {
                type: String,
                enum: ["Point"],
                required: true
            },
            coordinates: {
                type: [Number],
                required: true
            }
        }
    },

    estimatedDeliveryDate: {
        type: String,
        required: true
    },

    orderDate: {
        type: String,
        default: function () {
            return new Date(Date.now()).toString().slice(4, 15);
        }
    },

    orderStatus: {
        type: String,
        enum: ["Pending", "Shipped", "Delivered", "Cancelled", "Returned"],
        default: "Pending"
    }

})


const Order = mongoose.model("Order", orderSchema);

module.exports = Order;