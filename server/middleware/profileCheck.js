require("dotenv").config();

const profileCheck = {
  allow:
    (...ids) =>
    (req, res, next) => {
      // 401 Unauthorized
      // 403 Forbidden

      if (!req.user) return res.status(401).send("Access denied. No user");
      if (ids.includes(Number(req.user.profileid))) return next();
      return res
        .status(403)
        .send("Access denied. You dont have the right profile");
    },

  isStoreManager: (req, res, next) => {
    // 401 Unauthorized
    // 403 Forbidden
    if (!req.user) return res.status(401).send("Access denied. No user");
    if (req.user.profileid == 1) {
      next();
    } else {
      return res
        .status(403)
        .send("Access denied.Dont have Store manager Profile");
    }
  },
  isInventoryManager: (req, res, next) => {
    // 401 Unauthorized
    // 403 Forbidden
    if (!req.user) return res.status(401).send("Access denied. No user");
    if (req.user.profileid == 2) {
      next();
    } else {
      return res
        .status(403)
        .send("Access denied.Dont have Inventory manager Profile");
    }
  },
  isCashier: (req, res, next) => {
    // 401 Unauthorized
    // 403 Forbidden
    if (!req.user) return res.status(401).send("Access denied. No user");
    if (req.user.profileid == 3) {
      next();
    } else {
      return res
        .status(403)
        .send("Access denied.Dont have Inventory manager Profile");
    }
  },
};

module.exports = profileCheck;
