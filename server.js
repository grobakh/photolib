var app = require('./app');
var debug = require('debug')('photolib:server');
var http = require('http');
var couchpenter = new (require('couchpenter'))();

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

var port = normalizePort(process.env.PORT || '8080');
var server = http.createServer(app);

server.on('error', function (error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
  case 'EACCES':
    debug(bind + ' requires elevated privileges');
    process.exit(1);
    break;
  case 'EADDRINUSE':
    debug(bind + ' is already in use');
    process.exit(1);
    break;
  default:
    throw error;
  }
});

server.on('listening', function () {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
});

app.set('port', port);

couchpenter.setUp(function (error, results) {
  if (error) {
    debug(error);
    throw error;
  }

  debug(results);

  server.listen(port);
});
