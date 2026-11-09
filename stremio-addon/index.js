"use strict";

const { serveHTTP } = require("stremio-addon-sdk");
const { addonInterface } = require("./addon");

const PORT = Number(process.env.PORT || 7000);
serveHTTP(addonInterface, { port: PORT });
console.log(`Stremio addon listening on port ${PORT}`);
