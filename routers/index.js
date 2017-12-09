'use strict'

//REQUERIMIENTOS
//var router_main = require('../controllers/main.js');
var router_metric = require('../api/metric.js');

//RUTEO
var routers = function(server) {
	server.use('/api/', router_metric);
};

//EXPORTACION
module.exports = routers;