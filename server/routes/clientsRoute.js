const express = require("express");
const auth = require("../middleware/auth");
const profileCheck = require("../middleware/profileCheck");
const clientsCrontroller = require("../controllers/clientsController");

const clientsRoute = express.Router();

clientsRoute.get(
  "/clients",
  [auth, profileCheck.allow(1, 3)],
  clientsCrontroller.list,
);

clientsRoute.get(
  "/clients/:clientId",
  [auth, profileCheck.allow(1, 3)],
  clientsCrontroller.listById,
);

clientsRoute.post(
  "/clients",
  [auth, profileCheck.allow(1, 3)],
  clientsCrontroller.create,
);

clientsRoute.put(
  "/clients/:clientId",
  [auth, profileCheck.allow(1, 3)],
  clientsCrontroller.update,
);

clientsRoute.delete(
  "/clients/:clientId",
  [auth, profileCheck.isStoreManager],
  clientsCrontroller.delete,
);

module.exports = clientsRoute;
