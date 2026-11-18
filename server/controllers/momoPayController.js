require("dotenv").config();
const Joi = require("joi");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const {
  getMomoToken,
  clearMomoTokenCache,
} = require("../services/CreateTokenAPI");
const { wrapController } = require("../middleware/asyncHandler");

// The MoMo access token stays on the server: it is fetched (and cached) here
// for every MoMo call and is never sent to the client.
const momoHeaders = (accessToken, extra = {}) => ({
  "Ocp-Apim-Subscription-Key": process.env.MoMoSubscriptionKey,
  "X-Target-Environment": "sandbox",
  Authorization: "Bearer " + accessToken,
  ...extra,
});

// Logs only the status and message: the full axios error contains the request
// headers, i.e. the access token and the subscription key.
const momoFailure = (res, error, step) => {
  const status = error.response?.status;
  if (status === 401) clearMomoTokenCache(); // token rejected: get a new one next time
  console.error(`MoMo ${step} failed:`, status || "", error.message);
  return res.status(502).send("MoMo request failed.");
};

const momoPayController = {
  doPayment: async (req, res) => {
    const referenceId = uuidv4();

    let accessToken;
    try {
      accessToken = await getMomoToken();
    } catch (error) {
      return momoFailure(res, error, "token request");
    }

    let response;
    try {
      response = await axios.post(
        process.env.MoMoURL + "collection/v1_0/requesttopay",
        {
          amount: req.body.amount,
          currency: req.body.currency,
          externalId: req.body.externalId,
          payer: {
            partyIdType: "MSISDN",
            partyId: req.body.phone,
          },
          payerMessage: req.body.payerMessage,
          payeeNote: req.body.payeeNote,
        },
        { headers: momoHeaders(accessToken, { "X-Reference-Id": referenceId }) },
      );
    } catch (error) {
      return momoFailure(res, error, "request to pay");
    }

    if (response.status !== 202) {
      console.error("MoMo request to pay: unexpected status", response.status);
      return res.status(502).send("MoMo request failed.");
    }
    // Only the payment reference is returned; use it with /momopay/transactionstatus.
    res.status(200).json({ data: { uuid: referenceId } });
  },

  getTransactionStatus: async (req, res) => {
    // The reference is put into the MoMo URL, so it must be a real UUID.
    // Other fields (e.g. authToken from older clients) are ignored.
    const { error } = Joi.object({ uuid_user: Joi.string().guid().required() })
      .unknown(true)
      .validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let accessToken;
    try {
      accessToken = await getMomoToken();
    } catch (err) {
      return momoFailure(res, err, "token request");
    }

    try {
      const response = await axios.get(
        process.env.MoMoURL + "collection/v1_0/requesttopay/" + req.body.uuid_user,
        { headers: momoHeaders(accessToken) },
      );
      return res.status(200).json({ data: response.data });
    } catch (err) {
      if (err.response?.status === 404)
        return res.status(404).send("Transaction not found.");
      return momoFailure(res, err, "transaction status");
    }
  },
};

// Errors thrown by any handler go to middleware/errorHandler.js.
module.exports = wrapController(momoPayController);
