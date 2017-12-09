'use strict'

//REQUERIMIENTOS

var express = require('express');
var tsv = require("node-tsv-json");

var router = express.Router();

var admin = require("firebase-admin");

var serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://libertech-ddc11.firebaseio.com"
});


//Requerimiento de modelo speciality
var Metric = require('../models/metric');

router.route('/cargar-datos/')
	.get(function(req, res) {
	  tsv({
	    input: "./files/datasettest.tsv", 
	    output: "./files/datasettest.json",
	    parseRows: true
	  }, function(err, result) {
	    if(err) {
	      console.error(err);
	    }else {
	      console.log(result);
	    }
	  });
	})


// Operacion Read a toda la coleccion
router.route('/metrics/')
	.get(function(req,res){
		// Obtener toda la coleccion specialities
		Metric.find()
		.then( function(metricas) {
			res.json(metricas);
		})
	});


router.route('/metrics/generar-data/')
	.post(function(req,res){
		var fecha = req.body.fecha;
		var horas = []
		for (var i = 0; i < 24; i++) {
			if (i<10) {
				horas.push( "0"+i+":00:00")
			} else{
				horas.push( i+":00:00")
			}
		}
		horas.forEach(function(hora) {
			var user_id = "carlos01"
			var litros = Math.floor(Math.random() * 178);
			var metrica = new Metric({ 
				fecha: fecha,
				hora: hora,
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

					var db = admin.database();
					var ref = db.ref("/");
					var MetricRef = ref.child("metric");
					MetricRef.child(`${ metrica._id }`).set({
					  fecha: fecha,
				    hora: hora,
				    litros: litros,
				    user_id: user_id
					});
					//res.json({success:true,metrica:metrica});
				}
			})
		})
		res.send("Gracias")
	})

// CREATE
router.route('/metrics/test')
	.post(function(req,res){
		console.log( req.body.data )
		res.send("Gracias")
	})

router.route('/metrics/test/1/')
	.post(function(req,res){
		var data = req.body.data
		var array_data = data.split(",")

		var fecha = array_data[3];
		var hora = array_data[5];
		var litros = array_data[1];
		var user_id = "carlos01";

		var metrica = new Metric({ 
			fecha: fecha,
			hora: hora,
			litros: litros,
			user_id: user_id
		})
		console.log( metrica )
		res.send("Gracias")
	})


// Operacion Create en la coleccion
router.route('/metrics')
	.post(function(req,res){
		// Obtencion de variables del body
		var data = req.body.data
		var array_data = data.split(",")

		var fecha = array_data[3];
		var hora = array_data[5];
		var litros = array_data[1];
		var user_id = "carlos01";

		var metrica = new Metric({ 
			fecha: fecha,
			hora: hora,
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

				var db = admin.database();
				var ref = db.ref("/");
				var MetricRef = ref.child("metric");
				MetricRef.child(`${ metrica._id }`).set({
				  fecha: fecha,
			    hora: hora,
			    litros: litros,
			    user_id: user_id
				});
				res.json({success:true,metrica:metrica});
			}
		})
	});

//EXPORTACION
module.exports = router;
