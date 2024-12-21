const jwt = require("jsonwebtoken");
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function jwtVerification(req, res, next) {
    const token = req.cookies.token;
    if (token) {
        try {

            jwt.verify(token, JWT_SECRET, (err, user) => {
                if (err) {
                    return res.status(403).json({ message: 'Token is not valid' });
                }
                req.user = user;

                next();
            })

        } catch (error) {
            next(error);
        }

    } else {
        res.status(401).json({ message: 'Authorization header missing, Login required' });
    }
}