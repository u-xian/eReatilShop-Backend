const express = require("express");
const auth = require("../middleware/auth");
const profileCheck = require("../middleware/profileCheck");
const shopController = require("../controllers/shopController");

const shopRoute = express.Router();

shopRoute.get("/shop", auth, shopController.list);

shopRoute.get("/shop/:shopId", auth, shopController.listById);

shopRoute.post(
  "/shop",
  [auth, profileCheck.isStoreManager],
  shopController.create,
);

shopRoute.put(
  "/shop/:shopId",
  [auth, profileCheck.isStoreManager],
  shopController.update,
);

shopRoute.delete(
  "/shop/:shopId",
  [auth, profileCheck.isStoreManager],
  shopController.delete,
);

module.exports = shopRoute;
