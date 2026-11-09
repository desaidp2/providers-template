'use strict';
const { serveHTTP } = require('stremio-addon-sdk');
const { makeBuilder } = require('./addon');

const { builder } = makeBuilder();
const port = Number(process.env.PORT || 7000);
serveHTTP(builder.getInterface(), { port });
