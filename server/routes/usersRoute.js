const express = require("express");
const auth = require("../middleware/auth");
const profileCheck = require("../middleware/profileCheck");

const usersCrontroller = require("../controllers/usersController");

const usersRoute = express.Router();

usersRoute.get(
  "/user",
  [auth, profileCheck.isStoreManager],
  usersCrontroller.list,
);

usersRoute.get(
  "/user/:userId",
  [auth, profileCheck.isStoreManager],
  usersCrontroller.listById,
);

usersRoute.post(
  "/user",
  [auth, profileCheck.isStoreManager],
  usersCrontroller.create,
);

usersRoute.put(
  "/user/:userId",
  [auth, profileCheck.isStoreManager],
  usersCrontroller.update,
);

usersRoute.delete(
  "/user/:userId",
  [auth, profileCheck.isStoreManager],
  usersCrontroller.delete,
);

module.exports = usersRoute;
