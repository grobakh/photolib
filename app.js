var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var stylus = require('stylus');
var nib = require('nib');
var i18n = require('i18n');
var basicAuth = require('basic-auth-connect');

var routes = require('./routes/index');
var adminDashboard = require('./routes/admin');

// i18n configure
i18n.configure({
  locales: ['ru'],
  defaultLocale: 'ru',
  cookie: 'photolib-yellowfish',
  directory: __dirname + '/locales',
  updateFiles: false
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// app.disable('etag');

app.use(favicon(__dirname + '/public/favicon.png'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(cookieParser());
app.use(i18n.init);

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib());
}

app.use(stylus.middleware(
  {
    src: path.join(__dirname, 'public'),
    compile: compile
  }
));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

/*app.use(basicAuth(function(user, pass, fn){
 User.authenticate({ user: user, pass: pass }, fn);
 }))*/
app.use('/admin', adminDashboard);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
