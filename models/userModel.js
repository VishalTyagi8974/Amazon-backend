const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },

    isSeller: {
        type: Boolean,
        default: false,
        required: true
    },
    soldProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    }],

    cart: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        quantity: {
            type: Number,
            min: 1,
            required: true,
        }
    }],

    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    }],

    addresses: [
        {
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
        }
    ]

})

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);

module.exports = User;