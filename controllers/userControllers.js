const passport = require("passport");
const User = require("../models/userModel");

const jwt = require("jsonwebtoken");
const cartValidation = require("../utils/cartValidation");
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

const JWT_SECRET = process.env.JWT_SECRET;

const signUpUser = async (req, res, next) => {
    try {
        const { username, email, password, isSeller, cart } = req.body;

        const newUser = new User({ username, email, isSeller, cart });

        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);

        if (registeredUser) {
            const response = await logInUser(req, res, next)
            return response

        } else {
            return res.status(404).json({ message: "Something went wrong, retry" });
        }

    } catch (e) {
        return res.status(500).json({ message: "Something went wrong, try a different username or email" });
    }
};



const logInUser = async (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }
        if (!user) {
            console.error("Authentication failed:", info);
            return res.status(401).json({ message: info.message || 'Authentication failed' });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
            secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
            maxAge: 3600000 // 1 hour
        });

        return res.status(200).json({ message: 'Login successful', token });

    })(req, res, next); // This ensures passport.authenticate runs within the request-response cycle
};


const userProfileData = async (req, res, next) => {
    if (req.user) {
        const userData = await User.findById(req.user.id);
        if (userData) {
            res.status(200).json(userData);
        } else {
            res.status(404).json({ message: "Something Went Wrong!" });
        }
    }
    else {
        res.status(401).json({ message: "Login or Registration required!" });
    }
}

const logOutUser = (req, res) => {
    // Clear the cookie by setting its expiration date to the past
    res.clearCookie('token', {
        httpOnly: true, // HTTP-only for security
        secure: process.env.NODE_ENV === 'production',    // Secure cookie (HTTPS)
        sameSite: 'strict', // CSRF protection
    });

    return res.status(200).json({ message: 'Logged out successfully' });
}

const checkAuthStatus = (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(200).json({ isAuthenticated: false });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(200).json({ isAuthenticated: false });
        }
        return res.status(200).json({ isAuthenticated: true });
    });
}
const updateCart = async (req, res) => {
    const userId = req.user.id

    const { cart } = req.body; // Get userId and merged cart from request

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.cart = cartValidation(cart);

        await user.save();

        res.status(200).json({ message: 'Cart updated successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error updating cart', error: error.message });
    }
}
const updateCartItem = async (req, res) => {
    const userId = req.user.id;
    const { cartItem } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const [{ product, quantity }] = cartValidation([cartItem]);

        const existingItemIndex = user.cart.findIndex(
            (item) => item.product.toString() === product._id
        );

        if (existingItemIndex >= 0) {
            user.cart[existingItemIndex].quantity = quantity;
        } else {
            user.cart.push({ product, quantity });
        }

        await user.save();

        return res.status(200).json({ message: 'Cart updated successfully', cartItem: cartItem });
    } catch (error) {
        return res.status(400).json({ message: 'Error updating cart', error: error.message });
    }
};

const getCartData = async (req, res, next) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId).populate('cart.product');
        console.log(user)

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log(user.cart)
        return res.status(200).json({ cart: user.cart })
    } catch (error) {
        return next(error);
    }

}

const deleteCartItem = async (req, res, next) => {
    const userId = req.user.id;
    const { product } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.cart = user.cart.filter((item) => (
            item.product.toString() !== product._id
        ));

        await user.save();
        return res.status(200).json({ message: 'Cart updated successfully', product });
    } catch (error) {
        return res.status(400).json({ message: 'Error updating cart', error: error.message });
    }
}


const addAddress = async (req, res, next) => {
    const userId = req.user.id;
    const { newAddress } = req.body;

    const user = await User.findById(userId);
    user.addresses.push(newAddress);

    await user.save();
    res.status(200).json({ message: "succesfully added new Address" });

}
module.exports = { logInUser, userProfileData, signUpUser, logOutUser, checkAuthStatus, updateCart, updateCartItem, getCartData, deleteCartItem, addAddress }
