
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.redirect('/login'); // Redirect to login page if no token
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.redirect('/login'); // Redirect to login if token is invalid
    }
}

module.exports = verifyToken;
