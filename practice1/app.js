var createError = require('http-errors');
var express = require('express');
var path = require('path');

var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var joinRouter = require('./routes/joinForm');
var boardRouter = require('./routes/board');
var loginRouter = require('./routes/loginForm');
var timetableRouter = require('./routes/timetable');
var friendRouter = require('./routes/friend');
//var logoutRouter = require('./routes/logout');
var app = express();
var updateRouter = require('./routes/update');
var find_IDRouter = require('./routes/find_ID');
var find_passwdRouter = require('./routes/find_passwd');
var gradeRouter = require('./routes/grade');
// var resultRouter = require('./routes/result');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname + '/image'));
app.use('/board/read/', express.static('./image'));
app.use('/', loginRouter);
//app.use('/join', join);
app.use('/users', usersRouter);
app.use('/board', boardRouter);
app.use('/login', loginRouter);
app.use('/index', indexRouter);
app.use('/timetable', timetableRouter);
app.use('/friend', friendRouter);
//app.use('/logout',logoutRouter);
app.use('/joinForm', joinRouter);
app.use('/update', updateRouter);
app.use('/find_ID', find_IDRouter);
app.use('/find_passwd', find_passwdRouter);
app.use('/grade', gradeRouter);
// app.use('/result', resultRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
