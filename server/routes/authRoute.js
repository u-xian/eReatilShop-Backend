const express = require("express");
const auth = require("../middleware/auth");
const authCrontroller = require("../controllers/authController");

const authRoute = express.Router();

authRoute.post("/auth", authCrontroller.auth);

// Logged-in users only, and only for their own account (checked in the controller).
authRoute.put("/auth/:userId", auth, authCrontroller.updateFirstLogin);

module.exports = authRoute;
