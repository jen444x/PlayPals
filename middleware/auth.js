const jwt = require("jsonwebtoken");
const config = require("../config");

const JWT_SECRET = config.JWT_SECRET;

function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).send("Access denied");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send("Invalid token");
  }
}

module.exports = auth;
