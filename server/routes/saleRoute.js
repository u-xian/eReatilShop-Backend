const express = require("express");
const auth = require("../middleware/auth");
const profileCheck = require("../middleware/profileCheck");
const saleController = require("../controllers/saleController");

const saleRoute = express.Router();

saleRoute.get("/sale", [auth, allow(1, 3)], saleController.list);

saleRoute.get("/sale/:saleId", [auth, allow(1, 3)], saleController.listById);

saleRoute.post("/sale", [auth, allow(1, 3)], saleController.create);

saleRoute.put(
  "/sale/:saleId",
  [auth, profileCheck.isStoreManager],
  saleController.update,
);

saleRoute.delete(
  "/sale/:saleId",
  [auth, profileCheck.isStoreManager],
  saleController.delete,
);

module.exports = saleRoute;
