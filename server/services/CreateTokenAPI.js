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

// Server-side cache of the MoMo access token, so payments and status checks
// reuse one token instead of creating a new MoMo API user on every request.
// The token never leaves the server through the payment routes.
const REFRESH_MARGIN_MS = 60 * 1000; // get a new token 1 minute before expiry
let cachedToken = null; // { accessToken, expiresAt }
let pendingToken = null; // shared by concurrent callers while a token is fetched

const getMomoToken = async () => {
  if (cachedToken && Date.now() < cachedToken.expiresAt - REFRESH_MARGIN_MS)
    return cachedToken.accessToken;

  if (!pendingToken) {
    pendingToken = createMomoToken()
      .then((data) => {
        const lifetimeMs = Number(data.expires_in) > 0 ? data.expires_in * 1000 : 0;
        cachedToken = {
          accessToken: data.access_token,
          expiresAt: Date.now() + lifetimeMs,
        };
        return data.access_token;
      })
      .finally(() => {
        pendingToken = null;
      });
  }
  return pendingToken;
};

// Called when MoMo rejects the token (401), and by tests.
const clearMomoTokenCache = () => {
  cachedToken = null;
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
module.exports.getMomoToken = getMomoToken;
module.exports.clearMomoTokenCache = clearMomoTokenCache;
