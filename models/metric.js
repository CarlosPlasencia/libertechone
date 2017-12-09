'use strict'

//Requerimiento de mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema

//Definición del esquema
var metricSchema = new Schema({
	fecha: Date,
	hora: String,
	litros: Number,
	user_id: String,
	created: {type: Date, default: Date.now},
})

// Convertimos a modelo y exportamos
module.exports = mongoose.model('metric', metricSchema)
