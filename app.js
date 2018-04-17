// Dependencies
// -----------------------------------------------------
var express   = require('express');
var path      = require('path');
var favicon   = require('serve-favicon');
var logger    = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config    = require('./config/config');
var api       = require('./routes/api');
var passport  = require('passport');
var session   = require('express-session');
var MongoStore = require('connect-mongo')(session);
//var routes = require('./routes/routes');
var _ = require('underscore');
var debug = require('debug')('nspoolingcar:server');

require('./controllers/passport')(passport);


function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

var port = normalizePort(process.env.PORT || '3000');


//  Database
// ------------------------------------------------------
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect(config.db.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("DB connection succesful!");
});



// Express
// ------------------------------------------------------
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(favicon(path.join(__dirname, 'public/assets/icons', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

var http = require('http');
var server = http.createServer(app)
var socket = require('./socket')(server);

// Headers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: "secret nscarpooling",
    store: new MongoStore({
    mongooseConnection:  mongoose.connection})
  }));
app.use(passport.initialize());

// Routes
// ------------------------------------------------------
//app.use('/', routes);

app.get('/', function (req, res) {
  	res.render('app');
});
app.use('/api', api);
app.use('/auth', require('./routes/auth'));

// error handlers
// ------------------------------------------------------
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  res.status(404).send('Not Found')
});

app.use(function(err, req, res, next){
  console.log(err);
  if(!res.headersSent) res.status(err.code || 500).send(err.message);
});

app.on('error', onError);
app.on('listening', onListening);

app.listen(port);

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = app.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

module.exports = app;
