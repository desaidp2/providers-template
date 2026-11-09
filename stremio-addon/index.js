'use strict';
const { getRouter } = require('stremio-addon-sdk');
const { makeBuilder } = require('./addon');

const { builder } = makeBuilder();
const port = Number(process.env.PORT || 7000);
require('http').createServer(getRouter(builder.getInterface())).listen(port, () => {
  console.log('Vega Public Video Stremio addon listening on port ' + port);
});
