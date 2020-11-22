var express = require('express');
var router = express.Router();
var session = require('express-session');
var bodyParser = require('body-parser');

var mysql = require('mysql');
var connection = mysql.createConnection({
  connectionLimit: 5,
    host: '10.20.22.36',
    port:3306,
    database: 'database2',
    user: 'Perfect',
    password: 'pro4spro4s!'
});
connection.connect((err)=>{
  if(err){
    console.log('Not connected to DB');
    throw err;
  }
  else{
    console.log('Sucess Connected');
  }
});
const { request, response } = require('../app');


var app = express();


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({
  secret:'secret',
  resave: true,
  saveUninitialized: true
}));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('loginForm',{title: 'login'});
});

router.post('/', function(req,res,next){
  var stu_id=req.body.student_id;
  var passwd = req.body.password;
  if(stu_id && passwd){
    var sqlForIDPW = "select * from register_info where ID =? and Passwd = ?";
    connection.query(sqlForIDPW, [stu_id,passwd], function(error,results,fields){
      if(error){
        console.error("err: "+error);
          console.log(results);
          console.log(fields);
      }
      else if(results.length>0){
        //req.session.loggedin=true;
        //req.session.stu_id = student_id;
        res.redirect('/');
      }
      else{
        res.redirect('/login?e=' + encodeURIComponent('Incorrect username or password'));
      }
      res.end();
    });
  }else{
    res.send('아이디 그리고 비밀번호를 입력해주세요');
    res.end();
  }
});

module.exports = router;
