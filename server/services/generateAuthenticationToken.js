require("dotenv").config();
const jwt = require("jsonwebtoken");

// Tokens are signed and verified with the same library (jsonwebtoken) and the
// same algorithm (HS256). See middleware/auth.js for the verifying side.
const JWT_ALGORITHM = "HS256";
const JWT_EXPIRES_IN = "1h";

const generateAuthToken = (payload) =>
  jwt.sign(payload, process.env.jwtPrivateKey, {
    algorithm: JWT_ALGORITHM,
    expiresIn: JWT_EXPIRES_IN,
  });

module.exports = generateAuthToken;
module.exports.JWT_ALGORITHM = JWT_ALGORITHM;
