const express = require("express");
const auth = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const momoPayController = require("../controllers/momoPayController");
const CreateTokenAPI = require("../services/CreateTokenAPI");

const momoRoute = express.Router();

momoRoute.post("/generatetoken", auth, asyncHandler(CreateTokenAPI));
momoRoute.post("/momopay/pay", auth, momoPayController.doPayment);
momoRoute.post(
  "/momopay/transactionstatus",
  auth,
  momoPayController.getTransactionStatus,
);

module.exports = momoRoute;
