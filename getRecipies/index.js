const axios = require("axios");
const crypto = require("crypto");

module.exports = async function (context, req) {
  try {
    const { search_expression } = req.query;

    console.log(search_expression);

    const consumerKey = process.env.FATSECRET_CONSUMER_KEY;
    const consumerSecret = process.env.FATSECRET_CONSUMER_SECRET;

    const baseUrl = process.env.FATSECRET_URI;
    const method = "recipes.search.v3";

    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = crypto.randomBytes(16).toString("hex");

    const params = {
      oauth_consumer_key: consumerKey,
      oauth_nonce: nonce,
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: timestamp,
      oauth_version: "1.0",
      method: method,
      search_expression: search_expression,
      format: "json",
    };

    const paramString = Object.keys(params)
      .sort()
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      )
      .join("&");

    const signatureBaseString = `POST&${encodeURIComponent(
      baseUrl
    )}&${encodeURIComponent(paramString)}`;

    const signingKey = `${encodeURIComponent(consumerSecret)}&`;
    const oauthSignature = crypto
      .createHmac("sha1", signingKey)
      .update(signatureBaseString)
      .digest("base64");

    const options = {
      method: "POST",
      url: `${baseUrl}?${paramString}&oauth_signature=${encodeURIComponent(
        oauthSignature
      )}`,
    };

    const { data } = await axios(options);

    context.res = {
      status: 200,
      body: data,
    };
  } catch (error) {
    console.log("error", error.message);
    context.res = {
      status: 500,
      body: {
        msg: error.message.toString(),
      },
    };
  }
};
