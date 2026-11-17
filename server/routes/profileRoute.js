const express = require("express");
const auth = require("../middleware/auth");
const profileCheck = require("../middleware/profileCheck");
const profileCrontroller = require("../controllers/profileController");

const profileRoute = express.Router();

profileRoute.get(
  "/profile",
  [auth, profileCheck.isStoreManager],
  profileCrontroller.list,
);

profileRoute.get(
  "/profile/:profileId",
  [auth, profileCheck.isStoreManager],
  profileCrontroller.listById,
);

profileRoute.post(
  "/profile",
  [auth, profileCheck.isStoreManager],
  profileCrontroller.create,
);

profileRoute.put(
  "/profile/:profileId",
  [auth, profileCheck.isStoreManager],
  profileCrontroller.update,
);

profileRoute.delete(
  "/profile/:profileId",
  [auth, profileCheck.isStoreManager],
  profileCrontroller.delete,
);

module.exports = profileRoute;
