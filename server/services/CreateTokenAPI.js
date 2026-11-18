require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const Base64 = require("js-base64").Base64;
const axios = require("axios");

// Creates a MoMo sandbox API user and key, then exchanges them for an access
// token. Returns the token response ({ access_token, token_type, expires_in }).
// axios throws on any non-2xx response, so callers only need one catch.
const createMomoToken = async () => {
  const user_uuid = uuidv4();
  const subscription_key = process.env.MoMoSubscriptionKey;
  const baseURL = process.env.MoMoURL + "v1_0/apiuser";

  await axios(baseURL, {
    method: "post",
    headers: {
      "X-Reference-Id": user_uuid,
      "Ocp-Apim-Subscription-Key": subscription_key,
    },
    data: {
      providerCallbackHost: process.env.MoMoCallBack,
    },
  });

  const apiKeyResponse = await axios(baseURL + "/" + user_uuid + "/apikey", {
    method: "post",
    headers: {
      "Ocp-Apim-Subscription-Key": subscription_key,
    },
  });

  const encoded = Base64.encode(user_uuid + ":" + apiKeyResponse.data.apiKey);
  const tokenResponse = await axios(process.env.MoMoURL + "collection/token/", {
    method: "post",
    headers: {
      "X-Reference-Id": user_uuid,
      "Ocp-Apim-Subscription-Key": subscription_key,
      Authorization: "Basic " + encoded,
    },
  });

  return tokenResponse.data;
};

// Route handler for POST /generatetoken (mounted behind the auth middleware).
const CreateTokenAPI = async (req, res) => {
  try {
    const token = await createMomoToken();
    return res.status(200).json(token);
  } catch (error) {
    console.error("MoMo token request failed:", error.message);
    return res.status(502).send("Could not get a token from MoMo.");
  }
};

module.exports = CreateTokenAPI;
module.exports.createMomoToken = createMomoToken;
