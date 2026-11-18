require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const Base64 = require("js-base64").Base64;
const axios = require("axios");
const { createMomoToken } = require("../services/CreateTokenAPI");

const momoPayController = {
  doPayment: async (req, res) => {
    const user_uuid = uuidv4();
    const URL = process.env.MoMoURL + "collection/v1_0/requesttopay";
    // Get the MoMo token directly rather than calling our own /generatetoken
    // route over HTTP (that route now requires a logged-in user).
    let momoToken;
    try {
      momoToken = await createMomoToken();
    } catch (error) {
      console.error("MoMo token request failed:", error.message);
      return res.status(502).send("Could not get a token from MoMo.");
    }

    const authToken = "Bearer " + momoToken.access_token;
    const config = {
      method: "post",
      headers: {
        "X-Reference-Id": user_uuid,
        "Ocp-Apim-Subscription-Key": process.env.MoMoSubscriptionKey,
        "X-Target-Environment": "sandbox",
        Authorization: authToken,
      },
      data: {
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
    };

    try {
      let response = await axios(URL, config);
      if (response.status == "202"){
        res.status(200).json({ data: { uuid: user_uuid, authCode: authToken } });
      }else{
        return res.status(response.status).send("UUID  not found");
      }


    } catch (error) {
      console.log(error);
    }
  },
  getTransactionStatus: async (req, res) => {
    const URL =
      process.env.MoMoURL +
      "collection/v1_0/requesttopay/" +
      req.body.uuid_user;
    const config = {
      method: "get",
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.MoMoSubscriptionKey,
        "X-Target-Environment": "sandbox",
        Authorization: req.body.authToken,
      },
    };

    try {
      let response = await axios(URL, config);
      if (response.status == "200") {
        res.status(200).json( { data: response.data } );
      }
      return res.status(response.status).json(response.statusText);
    } catch (error) {
      console.log(error);
    }
  },
};

module.exports = momoPayController;
