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

const {
    request,
    response
} = require('../app');
var sessionStore = new MySQLStore(options);

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    store: sessionStore
}));

app.get('/', function(req, res, next) {
    res.redirect('/grade/total_grade');
});


app.get('/total_grade', function(req, res, next) {
    //const url = req.params.page;
    //console.log("hello");
    //console.log(url);
    pool.getConnection(function(err, connection) {
        var gettotalgradesql = "select * from total_grade where stu_id = ? order by open_date";
        var getSemesterGradeSql = "select * from open_class_info where stu_id = ?";
        var getSemesterCount = "select distinct open_date from open_class_info where stu_id=? ORDER BY `open_date`";
        var getMajorGrade = "select * from major_minor_grade where stu_id = ? and major_minor = 1";
        var getMinorGrade = "select * from major_minor_grade where stu_id = ? and major_minor = 0";
        var getFailedTable = "select * from failed_table where stu_id = ?;"
        var stunameSQL = "SELECT stu_name FROM register_info WHERE ID=?";
        var leftminorSQL = "SELECT * FROM lefted_major_minor_grade WHERE stu_id=? and major_minor=0;"
        var leftmajorSQL = "SELECT * FROM lefted_major_minor_grade WHERE stu_id=? and major_minor=1;"
        var leftminor = 0;
        var leftmajor = 0;
        var stu_name;
        if (req.session.user) {
            connection.query(stunameSQL, [req.session.user.id], function(err, row) {
                stu_name = row;
            });
            connection.query(gettotalgradesql, [req.session.user.id], function(err, grade) {
                //console.log("hello");
                //console.log(grade);
                if (err) console.error(err);
                //console.log("1개 글 조회 결과 확인 : ", row);
                //res.render('total_grade', { title: "수강/성적 조회", row: stu_name[0], grades: grade});
                //console.log(grade);
                connection.query(leftminorSQL, req.session.user.id, function(err, leftres) {
                    leftminor = leftres[0].lefted_credit;
                });
                connection.query(leftmajorSQL, req.session.user.id, function(err, leftres) {
                    leftmajor = leftres[0].lefted_credit;
                });

                connection.query(getSemesterGradeSql, [req.session.user.id], function(err, semester) {
                    connection.query(getSemesterCount, [req.session.user.id], function(err, semester_cnt) {
                        connection.query(getMajorGrade, [req.session.user.id], function(err, major) {
                            connection.query(getMinorGrade, [req.session.user.id], function(err, minor) {
                                connection.query(getFailedTable, [req.session.user.id], function(err, failed) {
                                    res.render('total_grade', {
                                        title: "수강/성적 조회",
                                        row: stu_name[0],
                                        grades: grade,
                                        semesters: semester,
                                        semesters_cnt: semester_cnt,
                                        majors: major,
                                        minors: minor,
                                        faileds: failed,
                                        leftmajor: leftmajor,
                                        leftminor: leftminor
                                    });
                                });
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

app.get('/give_eval/:page', function(req, res) {
    var url = req.params.page;
    pool.getConnection(function(err, connection) {
        var eval = Number(url[url.length - 1]);
        if (eval == 0) eval = 10;
        url = url.substr(0, url.length - 1);
        console.log(url, eval);
        var updateEval = "UPDATE class_info SET lec_eval = ? WHERE stu_id = ? and lec_num = ?";
        connection.query(updateEval, [eval, req.session.user.id, url], function(err, result) {
            console.log('result : ', result);
            if (err) console.log('err : ', err);
            res.redirect('back');
        });
    });
});

app.post('/comment/:page', function(req, res) {
    var url = req.params.page;
    pool.getConnection(function(err, connection) {
        var insertComment = "UPDATE class_info SET lec_eval_comment = ? WHERE stu_id = ? and lec_num = ?";
        connection.query(insertComment, [req.body.comment, req.session.user.id, url], function(err, result) {
            console.log(result, url);
            if (err) console.log('err : ', err);
            res.redirect('back');
        });
    });
});
module.exports = app;
