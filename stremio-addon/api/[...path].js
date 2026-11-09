"use strict";

// Vercel Node.js Function: project Root Directory should be "stremio-addon".
const { getRouter } = require("stremio-addon-sdk");
const { addonInterface } = require("../addon");

module.exports = getRouter(addonInterface);
