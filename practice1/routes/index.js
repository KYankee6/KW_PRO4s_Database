 var express = require('express');
var router = express.Router();
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var bodyParser = require('body-parser');

var options = {
    connectionLimit: 20,
    host: '223.194.46.205',
    port: 3306,
    database: 'database2',
    user: 'root',
    password: 'pro4spro4s!'
};
var sessionStore = new MySQLStore(options);

var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 5,
    host: '223.194.46.205',
    user: 'root',
    database: 'database2',
    password: 'pro4spro4s!'
});
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    store: sessionStore
}));
// router.get('/', function(req,res,next) {
//     pool.getConnection(function (err, connection) {
//         // Use the connection
//         var stunameSQL = "SELECT stu_name FROM register_info WHERE ID='2016722066'";
//         var deansList = "SELECT * FROM ranking WHERE open_date='2020-03-01'";
//         var Timetable = "SELECT * FROM current_time_table WHERE stu_id = '2016722066'";

//         connection.query(stunameSQL + deansList + Timetable, )

//     });
// });

app.post('/enroll/search', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        //Use the connection
        var baseQuery = "SELECT * FROM lecture_info WHERE lec_name like ? and open_date='2020-09-01'";
        var underQuery = "SELECT * FROM enrolled_list WHERE stu_id=?";
        var reqSearch = req.body.lec_name_for_search;
        var stunameSQL = "SELECT stu_name FROM register_info WHERE ID=?"
        var stu_name = [];
        var stu_id = req.session.user.id;
        var array = [];

        if (req.session.user && reqSearch) {
            
            connection.query(stunameSQL, [req.session.user.id], function(err, name) {
                stu_name = name[0].stu_name;
            });
            connection.query(underQuery, [req.session.user.id], function (err, enr_row) {
                if (err) console.error("err : " + err);
                // console.log(enr_row);
                for (var i = 0; i < enr_row.length; i++) {
                    if (enr_row[i].major_minor == 1) enr_row[i].major_minor = "전공";
                    else enr_row[i].major_minor = "교양";
                }
                array = enr_row;
            });
            connection.query(baseQuery, [reqSearch + "%"], function (err, s_enr_row) {
                if (err) console.error("err : " + err);
                //console.log(s_enr_row);
                for (var i = 0; i < s_enr_row.length; i++) {
                    if (s_enr_row[i].major_minor == 1) s_enr_row[i].major_minor = "전공";
                    else s_enr_row[i].major_minor = "교양";
                }
                console.log(s_enr_row);
                res.render('enroll', { title: "수강 신청", s_enr_row: s_enr_row, enr_row: array, stu_name:stu_name, stu_id:stu_id });
            });
        }
        else if (!reqSearch) {
            res.send("<script>alert('입력란을 채워주세요.');history.back();</script>");
            connection.release();
        }
        else {
            res.send("<script>alert('만료된 세션');history.back();</script>");
            connection.release();
        }
    });
});

app.get('/enroll', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        //Use the connection
        var baseQuery = "SELECT * FROM enrolled_list WHERE stu_id = ?";
        var stunameSQL = "SELECT stu_name FROM register_info WHERE ID=?"
        var stu_name = [];
        var stu_id = req.session.user.id;
        var array = [];
        if (req.session.user) {
            connection.query(stunameSQL, [req.session.user.id], function(err, name) {
                stu_name = name[0].stu_name;
            });
            connection.query(baseQuery, [req.session.user.id], function (err, enr_row) {
                if (err) console.error("err : " + err);
                console.log(enr_row);
                for (var i = 0; i < enr_row.length; i++) {
                    if (enr_row[i].major_minor == 1) enr_row[i].major_minor = "전공";
                    else enr_row[i].major_minor = "교양";
                }
                res.render('enroll', { title: "수강 신청", enr_row: enr_row, stu_name:stu_name, stu_id:stu_id});
            });
        }
        else {
            res.send("<script>alert('만료된 세션');history.back();</script>");
            connection.release();
        }
    });
});
app.get('/enroll/selectandshow/:lec_num', function (req, res, next){
    pool.getConnection(function (err, connection) {
    var lec_num = req.params.lec_num;
    var selandshowQuery = "select lec_name,location,credit,major_minor from lecture_info where lec_num =?";
    var baseQuery = "SELECT * FROM lecture_info WHERE lec_name like ? and open_date='2020-09-01'";
    var underQuery = "SELECT * FROM enrolled_list WHERE stu_id=?";
    var stunameSQL = "SELECT stu_name FROM register_info WHERE ID=?";
    var reqSearch = req.query.lec_name_for_search;
    console.log(reqSearch);
    var array = [];
    var sharr = [];
    var stu_name = [];
    var stu_id = req.session.user.id;
    if (req.session.user) {
        connection.query(stunameSQL, [req.session.user.id], function(err, name) {
            stu_name = name[0].stu_name;
        });
    }
    if (lec_num) {
        connection.query(selandshowQuery, [lec_num], function (err, shenr_row) {
            if (err) console.error("err : " + err);
            // console.log(enr_row);
            for (var i = 0; i < shenr_row.length; i++) {
                if (shenr_row[i].major_minor == 1) shenr_row[i].major_minor = "전공";
                else shenr_row[i].major_minor = "교양";
            }
            sharr = shenr_row;
        });
        connection.query(underQuery, [req.session.user.id], function (err, enr_row) {
            if (err) console.error("err : " + err);
            // console.log(enr_row);
            for (var i = 0; i < enr_row.length; i++) {
                if (enr_row[i].major_minor == 1) enr_row[i].major_minor = "전공";
                else enr_row[i].major_minor = "교양";
            }
            array = enr_row;
        });
        connection.query(baseQuery, [reqSearch + "%"], function (err, s_enr_row) {
            if (err) console.error("err : " + err);
            //console.log(s_enr_row);
            for (var i = 0; i < s_enr_row.length; i++) {
                if (s_enr_row[i].major_minor == 1) s_enr_row[i].major_minor = "전공";
                else s_enr_row[i].major_minor = "교양";
            }
            //console.log(s_enr_row);
            res.render('enroll', { title: "수강 신청", s_enr_row: s_enr_row, enr_row: array,sh_enr_row:sharr, stu_name:stu_name, stu_id:stu_id});
        });
    }
    else {
        res.send("<script>alert('원하시는 과목을 선택해주세요');history.back();</script>");
        connection.release();
    }
});
});


app.post('/enroll/drop', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        var dropSQL = "DELETE FROM class_info WHERE stu_id = ? and lec_num = ?";
        console.log(req.body.lesson_selected, req.session.user.id);
        connection.query(dropSQL, [req.session.user.id, req.body.lesson_selected], function(err, result) {
            res.send("<script>alert('강의 삭제 완료.');history.back();</script>");
            res.end();
        });
    });
});

app.get('/', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        //Use the connection
        var stunameSQL = "SELECT stu_name FROM register_info WHERE ID=?";
        var deansList = "SELECT * FROM ranking WHERE open_date='2020-03-01'";
        var Timetable = "SELECT * FROM current_time_table WHERE stu_id = ?";
        var lec_name = new Array(6);
        var professor = new Array(6);
        var location = new Array(6);
        var color = new Array(6);
        for (var i = 0; i < 6; i++) {
            lec_name[i] = new Array(5);
            professor[i] = new Array(5);
            location[i] = new Array(5);
            color[i] = new Array(5);
            for (var j = 0; j < 5; j++) {
                lec_name[i][j] = " ";
                professor[i][j] = " ";
                location[i][j] = " ";
                color[i][j] = 0;
            }
        }
        console.log(lec_name);
        if (req.session.user) {
            //console.log(req.session.user);
            connection.query(stunameSQL, [req.session.user.id], function (err, row) {
                connection.query(deansList, function (err, rows) {
                    connection.query(Timetable, [req.session.user.id], function (err, table) {
                        if (err) console.error("err : " + err);
                        for (var i = 0; i < table.length; i++) {
                            var num1 = Number(table[i].time_stamp[3]);
                            num1 = num1 - 1;
                            var num2;
                            if (table[i].time_stamp[1] == 'O') {
                                num2 = 0;
                            }
                            else if (table[i].time_stamp[1] == 'U') {
                                num2 = 1;
                            }
                            else if (table[i].time_stamp[1] == 'E') {
                                num2 = 2;
                            }
                            else if (table[i].time_stamp[1] == 'H') {
                                num2 = 3;
                            }
                            else {
                                num2 = 4;
                            }
                            lec_name[num1][num2] = lec_name[num1][num2].replace(" ", table[i].lec_name);
                            professor[num1][num2] = professor[num1][num2].replace(" ",  table[i].professor);
                            location[num1][num2] = location[num1][num2].replace(" ",  "("+table[i].location+")");
                            color[num1][num2] = i;
                        }
                        for (var i = 0; i < table.length; i++) {
                            var num1 = Number(table[i].time_stamp[7]);
                            num1 = num1 - 1;
                            var num2;
                            if (table[i].time_stamp[5] == 'O') {
                                num2 = 0;
                            }
                            else if (table[i].time_stamp[5] == 'U') {
                                num2 = 1;
                            }
                            else if (table[i].time_stamp[5] == 'E') {
                                num2 = 2;
                            }
                            else if (table[i].time_stamp[5] == 'H') {
                                num2 = 3;
                            }
                            else {
                                num2 = 4;
                            }
                            lec_name[num1][num2] = lec_name[num1][num2].replace(" ", table[i].lec_name);
                            professor[num1][num2] = professor[num1][num2].replace(" ",  table[i].professor);
                            location[num1][num2] = location[num1][num2].replace(" ",  "("+table[i].location+")");
                            color[num1][num2] = i;
                        }

                        console.log("Result: ", lec_name);
                        res.render('index', { title: '메인 화면', row: row[0], rows: rows, lec_name: lec_name, professor:professor, location:location });
                        connection.release();
                    });
                    if (err) console.error("err : " + err);
                    //Don't use the connection here, it has been returned to the pool.
                });
            });

        }
        else {
            res.send("<script>alert('만료된 세션');history.back();</script>");
            connection.release();
        }
    });
});

app.post('/logout', function (req, res) {
    delete req.session.user;
    req.session.save(() => {
        res.redirect('/login');
    });
});
module.exports = app;
