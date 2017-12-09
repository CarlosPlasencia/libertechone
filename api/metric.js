'use strict'

//REQUERIMIENTOS

var express = require('express');
var router = express.Router();

//Requerimiento de modelo speciality
var Metric = require('../models/metric');


// Operacion Read a toda la coleccion
router.route('/metrics/')
	.get(function(req,res){
		// Obtener toda la coleccion specialities
		Metric.find()
		.then( function(metricas) {
			res.json(metricas);
		})
	});


// CREATE

router.route('/metrics/test')
	.post(function(req,res){
		console.log( req.body.data )
		res.send("Gracias")
	})

// Operacion Create en la coleccion
router.route('/metrics')
	.post(function(req,res){
		// Obtencion de variables del body
		var fecha = req.body.fecha;
		var litros = req.body.litros;
		var user_id = req.body.user_id;

		var metrica = new Metric({ 
			fecha: fecha,
			litros: litros,
			user_id: user_id
		})
		// Almacenamiento del registro en la base de datos
		metrica.save(function(err) {
			if (err) {
				// Si hay un error al momento de guardar el registro 
				//nos muestra succes:false y cual fue el error 
				console.log(err);
				res.json({success:false,error:err});
			} else {
				// Si el registro se completo sin errores 
				// nos devuelve succes:true y el registro creado
				res.json({success:true,metrica:metrica});
			}
		})
	});

//EXPORTACION
module.exports = router;
