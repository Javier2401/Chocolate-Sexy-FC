const cds = require('@sap/cds');

cds.on('bootstrap', app => {
  app.get('/', (req, res, next) => {
    req.url = '/index.html';
    next();
  });
});

module.exports = cds.server;