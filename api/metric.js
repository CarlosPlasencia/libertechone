'use strict'

//REQUERIMIENTOS

var express = require('express');
var tsv = require("node-tsv-json");
var moment = require("moment");

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


router.route('/metrics/generar/')
	.post(function(req,res){	
		try{

			var x_datos = 400

			var array_nofuga = [0,0,0,0,0,0,0,0,11.69,46.78,47.68,20,38.68,38.68,20.69,11.69,20,4.25,35,19.79,25,19.79,19.79,20.69]
			var array_fuga = [11.69,28.79,36.88,29.69,20.69,18.89,9.9,19.79,38.68,45.88,55.77,64.77,55.77,54.87,54.87,55.77,55.77,56.67,54.87,45.88,47.68,46.78,47.68,46.78]

			var fecha = moment("11/28/17").subtract( x_datos ,"days")
			var data = []
			for (var i = 0; i < x_datos; i++) {
				var user_id = "carlos01"
				fecha = moment(fecha).add(1,"days")
				//console.log(moment(fecha).format("DD/MM/YYYY"))
				var data_dia = [] 
				var tipo_fuga = []

				if( i%5==0 || i%7==0 ){
					tipo_fuga = array_fuga
					data_dia[0] = 1
				} else {
					tipo_fuga = array_nofuga
					data_dia[0] = 0
				}
				var horas = []
				for (var j = 0; j <= 23; j++){
					horas.push( j+":59:59")
				}

				horas.forEach(function(hora){
					let hora_int = parseInt(hora.split(':')[0])
					let dato = tipo_fuga[hora_int]
					let maximo_variacion = 30
		      if (hora_int<=5 || hora_int>=21){
						if (data_dia[0] == 0)
							maximo_variacion = 10
						else
							maximo_variacion = 20
					}
					if (hora_int != 0 && hora_int != 1){
						dato = (parseFloat(data_dia[hora_int-1])+parseFloat(dato))/2
					}
										
					var litros = Math.floor(Math.random() * (parseInt(dato) + maximo_variacion))+(parseInt(dato) - maximo_variacion)
					litros = litros < 0 ? 0 : litros
					data_dia.push(litros)					
					var metrica = new Metric({ 
						fecha: fecha,
						hora: hora,
						litros: litros,
						user_id: user_id
					})

					//console.log( metrica )
					
					// Almacenamiento del registro en la base de datos
					//console.log( metrica )
					metrica.save(function(err) {
						if (err) {
							// Si hay un error al momento de guardar el registro 
							//nos muestra succes:false y cual fue el error 
							console.log(err);
							res.json({success:false,error:err});
						} else {
							// Si el registro se completo sin errores 
							// nos devuelve succes:true y el registro creado
							//console.log(moment( metrica.fecha ).format("DD/MM/YYYY"), metrica.hora )
							//console.log( "-->",hora )
							var db = admin.database();
							var ref = db.ref("/");
							var MetricRef = ref.child("metric");
							MetricRef.child(`${ metrica._id }`).set({
							  fecha: moment( metrica.fecha ).format("DD/MM/YYYY"),
						    dia: moment( metrica.fecha ).format("D"),
						    mes: moment( metrica.fecha ).format("M"),
						    año: moment( metrica.fecha ).format("YYYY"),
						    hora: hora,
						    litros: litros,
						    user_id: user_id
							});

							//res.json({success:true,metrica:metrica});
						}
					})
				})
				data.push( data_dia )
			}

			//guardar el archivo

			res.send("Gracias")
		}catch(err){
			console.log(err)
			res.send(err)
		}
	})

// CREATE
router.route('/metrics/test')
	.post(function(req,res){
		console.log( req.body.data )
		res.send("Gracias")
	})

router.route('/metrics/delete/')
	.post(function(req,res){
		var db = admin.database();
		//var ref = db.ref("/");
		//var MetricRef = ref.child("metric");
		//MetricRef.remove()

		var ref = admin.database().ref("/")
		
		ref.child("metric").orderByChild('mes').equalTo("11").on('child_added', function(snapshot) {
    	var dato = snapshot.val()
    	if ( dato.año =="2017" && (dato.dia == "29" || dato.dia == "30")){
    		//console.log("Snapshot.ref = " + snapshot.ref);
    		//console.log(dato.fecha)
    		snapshot.ref.remove()
    	}
    	
    	//snapshot.ref.remove();
    	return;
		});

		res.send("Gracias por borrar")
	})

router.route('/metrics/test/1/')
	.post(function(req,res){
		var data = req.body.data
		var array_data = data.split(",")
		var array_fecha = array_data[3].split("/")
		var dia = array_fecha[0]
		var mes = array_fecha[1]
		var año = array_fecha[2]

		var fecha = mes+"/"+dia+"/"+año;
		var hora = array_data[5];
		var litros = parseFloat(array_data[1]);
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
		var data = req.body.data
		var array_data = data.split(",")
		var array_fecha = array_data[3].split("/")
		var dia = array_fecha[0]
		var mes = array_fecha[1]
		var año = array_fecha[2]

		var fecha = mes+"/"+dia+"/"+año;
		var hora = array_data[5];
		var litros = parseFloat(array_data[1]);
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
				  fecha: moment( metrica.fecha ).format("DD/MM/YYYY"),
			    dia: moment( metrica.fecha ).format("D"),
			    mes: moment( metrica.fecha ).format("M"),
			    año: moment( metrica.fecha ).format("YYYY"),
			    hora: hora,
			    litros: litros,
			    user_id: user_id
				});
			}
		})
		res.send("gracias por guardar");
	});

//EXPORTACION
module.exports = router;
