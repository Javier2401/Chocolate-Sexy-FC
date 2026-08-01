const cds = require('@sap/cds');

cds.on('bootstrap', app => {
  app.get('/', (req, res) => res.redirect('/chocolatesexy.project/index.html'));
});

module.exports = cds.server;