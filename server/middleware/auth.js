require("dotenv").config();
const jwt = require("jsonwebtoken");
const { JWT_ALGORITHM } = require("../services/generateAuthenticationToken");

function auth(req, res, next) {
  // Fail closed: without a signing key no token can be checked, so refuse
  // the request instead of letting it through.
  if (!process.env.jwtPrivateKey) {
    console.error("jwtPrivateKey is not set; refusing authenticated request.");
    return res.status(500).send("Server authentication is not configured.");
  }

  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(token, process.env.jwtPrivateKey, {
      algorithms: [JWT_ALGORITHM],
    });
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError")
      return res.status(403).send("Token expired");
    res.status(400).send("Invalid token.");
  }
}

module.exports = auth;
