const express = require("express");
const auth = require("../middleware/auth");
const profileCheck = require("../middleware/profileCheck");
const orderController = require("../controllers/orderController");

const orderRoute = express.Router();

orderRoute.get(
  "/order",
  [auth, profileCheck.allow(1, 3)],
  orderController.list,
);

orderRoute.get(
  "/order/:orderId",
  [auth, profileCheck.allow(1, 3)],
  orderController.listById,
);

orderRoute.post(
  "/order",
  [auth, profileCheck.allow(1, 3)],
  orderController.create,
);

orderRoute.put(
  "/order/:orderId",
  [auth, profileCheck.isStoreManager],
  orderController.update,
);

orderRoute.delete(
  "/order/:orderId",
  [auth, profileCheck.isStoreManager],
  orderController.delete,
);

module.exports = orderRoute;
