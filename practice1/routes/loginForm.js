var express = require('express');
var session = require('express-session');
var mysql = require('mysql');
var MySQLStore = require('express-mysql-session')(session);
var http = require('http');
var router = express.Router();
var serverStatic = require('serve-static');
var path = require('path');
var cookieParser = require('cookie-parser');
//var passport = require('./config/passport');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var url = require('url');

//app.use(serveStatic(path.join(__dirname, 'public')));


var connection = mysql.createConnection({
  connectionLimit: 20,
  host: '223.194.46.205',
  port: 3306,
  database: 'database2',
  user: 'root',
  password: 'pro4spro4s!'
});

var options ={
  connectionLimit: 20,
  host: '223.194.46.205',
  port: 3306,
  database: 'database2',
  user: 'root',
  password: 'pro4spro4s!'
};
connection.connect((err) => {
  if (err) {
    console.log('Not connected to DB');
    throw err;
  }
  else {
    console.log('Sucess Connected');
  }
});
var app = express();

const { request, response } = require('../app');
var sessionStore = new MySQLStore(options);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  store: sessionStore
}));
var router = express.Router();

// app.use(passport.initialize());
// app.user(passport.session());
// app.use(function(req,res,next){
//   res.locals.isAuthenticated = req.isAuthenticated();
//   res.locals.currentUser = req.user;
//   next();
// });



/* GET home page. */
app.get('/', function (req, res, next) {
  console.log('세션 유저 확인후 루팅');
  if (req.session.user) {
    console.log(req.session);
    req.session.save(function(){
      res.redirect('index');
    });
  }
  else {
    res.render('loginForm');
  }
});



app.post('/', function (req, res, next) {
  var in_stu_id = req.body.student_id;
  var in_passwd = req.body.password;
  var salt = Math.round((new Date().valueOf() + Math.random())) + "";
  var hashPassword = crypto.createHash("sha512").update(in_passwd + salt).digest("hex");

  // var reuslt = models.user.create({
  //   name:in_stu_id,
  //   passwd: hashPassword,
  //   salt: salt
  // })
  if (req.session.user) {
    console.log('already logged in');
    res.redirect('index');
  }
  else if (in_stu_id && in_passwd) {
    var sqlForIDPW = "select * from register_info where ID =? and Passwd = ?";
    connection.query(sqlForIDPW, [in_stu_id, in_passwd], function (error, results, fields) {
      if (error) {
        console.error("err: " + error);
        console.log(results);
        console.log(fields);
      }
      else if (results.length > 0) {
        //req.session.loggedin=true;
        //req.session.stu_id = student_id;
        // res.json({stu_id :in_stu_id});
        req.session.user =
        {
          id: in_stu_id,
          pw: in_passwd,
          name: 'UsersNames!!!!!',
          authorized: true
        };

        res.redirect('index');
      }
      else {
        res.send("<script>alert('아이디 혹은 비밀번호를 확인하세요.');history.back();</script>")
        //res.redirect('/login?e=' + encodeURIComponent('Incorrect username or password'));
      }
      res.end();
    });
  }
  

   else {
    res.send("<script>alert('아이디 혹은 비밀번호를 입력하세요.');history.back();</script>")
    res.end();
  }
});

// app.post('/index', function(req,res){
//   sess=req.session;
// });
module.exports = app;
