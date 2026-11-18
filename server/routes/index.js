const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");

// Include Routes
const usersRoute = require("./usersRoute");
const authRoute = require("./authRoute");
const profileRoute = require("./profileRoute");

const categoryRoute = require("./categoryRoute");
const clientsRoute = require("./clientsRoute");
const productsRoute = require("./productsRoute");
const orderRoute = require("./orderRoute");
const saleRoute = require("./saleRoute");
const momoRoute = require("./momoRoute");
const shopRoute = require("./shopRoute");

const router = express.Router();

router.get("/", (req, res) =>
  res.status(200).send({
    message: "Welcome to the eRetailShop Backend API",
  }),
);
//Authentication
router.use("/", authRoute);

//Features routes
router.use("/", usersRoute);
router.use("/", categoryRoute);
router.use("/", clientsRoute);
router.use("/", productsRoute);
router.use("/", orderRoute);
router.use("/", saleRoute);
router.use("/", profileRoute);
router.use("/", shopRoute);
//Momo Payment
router.use("/", momoRoute);

//Get routes path
//displayRoutes(router);
module.exports = router;
