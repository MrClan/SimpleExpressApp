var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('lodash');
var form = require('express-form');
var field = form.field;
var ImapClient = require('emailjs-imap-client');

var http = require('http');
var https = require('https');
var fs = require('fs');

var httpsPort = 3443;
// Setup HTTPS
var options = {
  key: fs.readFileSync('sslkey.pem'),
  cert: fs.readFileSync('sslcert.pem'),
  passphrase: 'mrclan'
};

var app = express();
var secureServer = https.createServer(options, app).listen(httpsPort);
app.set('port_https', httpsPort);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Secure traffic only
app.all('*', function (req, res, next) {
  if (req.secure) {
    return next();
  };
  res.redirect('https://' + req.hostname + ':' + app.get('port_https') + req.url);
});

app.get('/', function (req, resp) {
  resp.render('index', { title: 'yo' });
});



app.post('/',
  // Form filter and validation middleware
  form(
    field("txtImap").trim(),
    field("txtPort").trim(),
    field("txtEmail").trim(),
    field("txtPwd").trim()
  ),

  // Express request-handler now receives filtered and validated data
  function (req, res) {
    if (!req.form.isValid) {
      // Handle errors
      console.log(req.form.errors);
    } else {
      var user = req.body.txtEmail;
      var psw = req.body.txtPwd;
      var client = new ImapClient('imap.gmail.com', 993, {
        auth: {
          user: 'daosirha@gmail.com',
          pass: 'shyambct525'
        }
      });
      client.onerror = function (error) {
        console.log(error);
      };
      client.connect().then(() => {
        client.listMessages('INBOX', '1:*', ['uid', 'flags', 'text', 'body:[]', 'envelope']).then((messages) => {
          messages.forEach((message) => {
            console.log('Flags for ' + message.uid + ': ' + message.flags.join(', ') + " " + message.body['Text'] + " " + message.envelope.subject);
          });
        });
      });
    }
  }
);

var emails = [
  { id: 1, subject: 'hi', recData: 'received data', sender: 'yo@yo.com' },
  { id: 2, subject: 'hello', recData: 'received data', sender: 'yo@yo.com' },
  { id: 1, subject: 'hi', recData: 'received data', sender: 'yo@yo.com' },
  { id: 2, subject: 'hello', recData: 'received data', sender: 'yo@yo.com' },
  { id: 1, subject: 'hi', recData: 'received data', sender: 'yo@yo.com' },
  { id: 2, subject: 'hello', recData: 'received data', sender: 'yo@yo.com' },
  { id: 1, subject: 'hi', recData: 'received data', sender: 'yo@yo.com' },
  { id: 2, subject: 'hello', recData: 'received data', sender: 'yo@yo.com' },
  { id: 1, subject: 'hi', recData: 'received data', sender: 'yo@yo.com' },
  { id: 2, subject: 'hello', recData: 'received data', sender: 'yo@yo.com' }
];

app.get('/emails', function (req, res) {
  res.render('emailList', { data: emails, title: 'title passed in' });
});

app.get('/detail/:id', function (req, res) {
  var id = req.params.id;
  var email = _.find(emails, function (e) {return e.id == id });
  if (email) {
    res.render('emailDetail', { em: email });
  } else {
    res.redirect('/emails');
  }
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
