var express = require('express');
var swig = require('swig');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors')

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Integración de body parser
app.use(cors())

mongoose.connect('mongodb://localhost/libertechone', { useMongoClient: true })
mongoose.Promise = global.Promise

//mongoose.connect('mongodb://NestorPlasencia:libertech@ds259175.mlab.com:59175/libertech', { useMongoClient: true });
//mongoose.Promise = global.Promise;

// Importacion de rutas
require('./routers')(app);

// CONFIGURACIONES DB

// Integración de mongoose

// views is directory for all template files
app.engine('html',swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
swig.setDefaults({cache: false});

app.get('/', function(request, response) {
  response.send( 'Node app is running on port' + app.get('port') )
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});