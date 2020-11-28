var express = require('express');
var router = express.Router();
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var cookieParser = require('cookie-parser');
//var passport = require('./config/passport');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 6,
    host: '223.194.46.205',
    user: 'root',
    port: 3306,
    database: 'database2',
    password: 'pro4spro4s!',
    //dateStrings:'date'
});


var options = {
    connectionLimit: 20,
    host: '223.194.46.205',
    port: 3306,
    database: 'database2',
    user: 'root',
    password: 'pro4spro4s!',
    //dateStrings:'date'
};

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

app.get('/', function (req, res, next) {
    res.redirect('/grade/total_grade');
});

app.get('/total_grade', function (req, res, next) {
    //const url = req.params.page;
    //console.log("hello");
    //console.log(url);
    pool.getConnection(function (err, connection) {
        var gettotalgradesql = "select * from total_grade where stu_id = ?";
        var getSemesterGradeSql = "select * from open_class_info where stu_id = ?"
        var getSemesterCount = "select distinct open_date from open_class_info where stu_id=? ORDER BY `open_date`";
        var getMajorGrade = "select * from major_minor_grade where stu_id = ? and major_minor = 1";
        var getMinorGrade = "select * from major_minor_grade where stu_id = ? and major_minor = 0";
        var stunameSQL = "SELECT stu_name FROM register_info WHERE ID=?";
        var stu_name;
        if (req.session.user) {
            connection.query(stunameSQL, [req.session.user.id], function (err, row) {
                stu_name = row;
            });
            connection.query(gettotalgradesql, [req.session.user.id], function (err, grade) {
                //console.log("hello");
                //console.log(grade);
                if (err) console.error(err);
                //console.log("1개 글 조회 결과 확인 : ", row);
                //res.render('total_grade', { title: "수강/성적 조회", row: stu_name[0], grades: grade});
                //console.log(grade);
                connection.query(getSemesterGradeSql, [req.session.user.id], function (err, semester){
                    connection.query(getSemesterCount,  [req.session.user.id], function (err, semester_cnt){
                        connection.query(getMajorGrade, [req.session.user.id], function (err, major){
                            connection.query(getMinorGrade, [req.session.user.id], function (err, minor){
                                res.render('total_grade', { title: "수강/성적 조회", row: stu_name[0], grades: grade, semesters: semester, semesters_cnt: semester_cnt, majors: major, minors: minor});
                                //console.log(semester_cnt);
                                //console.log(semester);
                                //console.log(grade);
                                //console.log(major);
                                //console.log(minor);
                            });
                        });
                    });
                    //res.render('total_grade', { title: "수강/성적 조회", row: stu_name[0], grades: grade, semesters: semester});
                    //console.log(semester);
                });
                //connection.query(getSemesterCount,  [req.session.user.id], function (err, semester_cnt){
                   // res.render('total_grade', { title: "학기별 성적", row: stu_name[0], grades: grade, semesters_cnt: semester_cnt});
                   // console.log(semester_cnt);
                connection.release();
            });
        }
        else {
            res.send("<script>alert('만료된 세션');history.back();</script>");
            connection.release();
        }
    });
});

app.post('/', function(req, res){
    var responseData = {};
   
    var query =  connection.query('select score from scoreboard where uid="ma" ORDER BY num DESC limit 10', function(err,rows){ 
      responseData.score = [];
      if(err) throw err;
      if(rows[0]){
        responseData.result = "ok";
        rows.forEach(function(val){
          responseData.score.push(val.score);
        })
      }
      else{
        responseData.result = "none";
        responseData.score = "";
      }
      res.json(responseData);
    });
  });
  
module.exports = app;