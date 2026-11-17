const express = require("express");
const auth = require("../middleware/auth");
const profileCheck = require("../middleware/profileCheck");
const categoryCrontroller = require("../controllers/categoryController");

const categoryRoute = express.Router();

categoryRoute.get("/category", auth, categoryCrontroller.list);

categoryRoute.get("/category/:categoryId", auth, categoryCrontroller.listById);

categoryRoute.post(
  "/category",
  [auth, allow(1, 2)],
  categoryCrontroller.create,
);

categoryRoute.put(
  "/category/:categoryId",
  [auth, allow(1, 2)],
  categoryCrontroller.update,
);

categoryRoute.delete(
  "/category/:categoryId",
  [auth, profileCheck.isStoreManager],
  categoryCrontroller.delete,
);

module.exports = categoryRoute;
