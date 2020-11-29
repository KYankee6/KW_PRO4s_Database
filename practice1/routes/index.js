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
// router.get('/', function(req,res,next) {
//     pool.getConnection(function (err, connection) {
//         // Use the connection
//         var stunameSQL = "SELECT stu_name FROM register_info WHERE ID='2016722066'";
//         var deansList = "SELECT * FROM ranking WHERE open_date='2020-03-01'";
//         var Timetable = "SELECT * FROM current_time_table WHERE stu_id = '2016722066'";
//         connection.query(stunameSQL + deansList + Timetable, )
//     });
// });
app.post('/enroll/search', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        //Use the connection
        var baseQuery = "SELECT * FROM lecture_info WHERE lec_name like ? and open_date='2020-09-01'";
        var underQuery = "SELECT * FROM enrolled_list WHERE stu_id=?";
        var reqSearch = req.body.lec_name_for_search;
        var array = [];
        var stu_id = req.session.user.id;
        var stu_name = req.session.user.name;
        if (req.session.user && reqSearch) {
            connection.query(underQuery, [req.session.user.id], function(err, enr_row) {
                if (err) console.error("err : " + err);
                // console.log(enr_row);
                for (var i = 0; i < enr_row.length; i++) {
                    if (enr_row[i].major_minor == 1) enr_row[i].major_minor = "전공";
                    else enr_row[i].major_minor = "교양";
                }
                array = enr_row;
            });
            console.log("array")
            console.log(array);
            connection.query(baseQuery, [reqSearch + "%"], function(err, s_enr_row) {
                if (err) console.error("err : " + err);
                //console.log(s_enr_row);
                for (var i = 0; i < s_enr_row.length; i++) {
                    if (s_enr_row[i].major_minor == 1) s_enr_row[i].major_minor = "전공";
                    else s_enr_row[i].major_minor = "교양";
                }
                console.log(s_enr_row);
                res.render('enroll', {
                    title: "수강 신청",
                    s_enr_row: s_enr_row,
                    enr_row: array,
                    stu_name: stu_name,
                    stu_id: stu_id
                });
                connection.release();
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
app.get('/enroll', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        //Use the connection
        var baseQuery = "SELECT * FROM enrolled_list WHERE stu_id = ?";
        var stunameSQL = "SELECT stu_name FROM register_info WHERE ID=?";
        var stu_id = req.session.user.id;
        var stu_name = req.session.user.name;
        var array = [];
        if (req.session.user) {
            connection.query(baseQuery, [req.session.user.id], function(err, enr_row) {
                if (err) console.error("err : " + err);
                console.log(enr_row);
                for (var i = 0; i < enr_row.length; i++) {
                    if (enr_row[i].major_minor == 1) enr_row[i].major_minor = "전공";
                    else enr_row[i].major_minor = "교양";
                }
                res.render('enroll', {
                    title: "수강 신청",
                    enr_row: enr_row,
                    stu_name: stu_name,
                    stu_id: stu_id
                });
                connection.release();
            });
        }
        else {
            res.send("<script>alert('만료된 세션');history.back();</script>");
            connection.release();
        }
    });
});
app.post('/enroll/apply', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        var lec_num = req.body.lec_num;
        var checkAlreadyTakenQuery = "select * from enrolled_list where stu_id=? and lec_num=?";
        var checkTimeAvailableQuery = "select time_stamp from enrolled_list where stu_id=?";
        var myLessonQuery = "select * from lecture_info where lec_num=?";
        var totalCreditQuery = "select * from total_grade where stu_id=?";
        var applyQuery = "select lec_name,location,credit,major_minor from lecture_info where lec_num =?";
        var underQuery = "SELECT * FROM enrolled_list WHERE stu_id=?";
        var TakeLessonQuery = "insert into class_info(lec_num,lec_name,stu_id,credit) values(?,?,?,?)";
        var stu_id = req.session.user.id;
        var stu_name = req.session.user.name;
        var isNoSameLecture = true;
        var isTimeAvailable = true;
        var isUnderMaxCredit = true;
        var information = [];
        var curSelectLesson = new Array(4);
        for (var i = 0; i < 4; i++) {
            curSelectLesson[i] = " ";
        }
        console.log(lec_num);
        if (lec_num) {
            connection.query(checkAlreadyTakenQuery, [stu_id, lec_num], function(err1, isAlreadyTaken) {
                isNoSameLecture = (Number(isAlreadyTaken.length) == 0);

                if (err1) {
                    console.log(err1);
                    //return connection.release();
                }
                if (!isNoSameLecture) { //같은 강좌 수강하는 경우
                    res.send("<script>alert('같은 강좌를 중복 수강할 수 없습니다');history.back(-1);</script>");
                }
            });
            if (isNoSameLecture) {
                connection.query(checkTimeAvailableQuery, [stu_id], function(err2, my_enr_rows) {
                    connection.query(myLessonQuery, [lec_num], function(err3, my_lesson) {
                        if (err2) {
                            console.log(err2);
                            //return connection.release();
                        }
                        else if (err3) {
                            console.log(err3);
                            //return connection.release();
                        }
                        //시간이 겹치는 경우 확인
                        for (var i = 0; i < my_enr_rows.length; i++) {
                            var check1 = my_enr_rows[i].time_stamp.substring(0, 4) == (my_lesson[0].time_stamp.substring(0, 4));
                            var check2 = my_enr_rows[i].time_stamp.substring(4) == (my_lesson[0].time_stamp.substring(4));
                            if (check1 || check2) {
                                isTimeAvailable = false;
                            }
                        }
                        if (isNoSameLecture && !isTimeAvailable) {
                            res.send("<script>alert('같은 시간에 이미 수강하는 강좌가 존재합니다..');history.back(-1);</script>");
                            //return connection.release();
                        }
                    });
                });
            }
            if (isNoSameLecture && isTimeAvailable) {
                connection.query(myLessonQuery, [lec_num], function(err3, my_lesson) {
                    connection.query(totalCreditQuery, [stu_id], function(err4, my_credit) {
                        isUnderMaxCredit = ((Number(my_credit[0].sum_credit) + Number(my_lesson[0].credit)) <= 21);
                        console.log(isUnderMaxCredit);

                        if (err4) {
                            console.log(err4);
                            //return connection.release();
                        }
                        else if (isNoSameLecture && isTimeAvailable && !isUnderMaxCredit) { //21 학점 넘는경우
                            res.send("<script>alert('21학점을 넘게 수강할 수 없습니다.');history.back(-1;</script>");
                            //return connection.release();
                        }

                    });
                });
            }
            connection.query(applyQuery, [lec_num], function(err, shenr_row) {
                connection.query(underQuery, [req.session.user.id], function(err, enr_row) {
                    if (err) console.error("err : " + err);
                    // console.log(enr_row);
                    for (var i = 0; i < shenr_row.length; i++) {
                        if (shenr_row[i].major_minor == 1) shenr_row[i].major_minor = "전공";
                        else shenr_row[i].major_minor = "교양";
                    }
                    if (err) console.error("err : " + err);
                    // console.log(enr_row);
                    for (var i = 0; i < enr_row.length; i++) {
                        if (enr_row[i].major_minor == 1) enr_row[i].major_minor = "전공";
                        else enr_row[i].major_minor = "교양";
                    }
                    information = {
                        title: "수강 신청",
                        sh_enr_row: shenr_row,
                        enr_row: enr_row,
                        stu_id: stu_id,
                        stu_name: stu_name
                    }
                });
            });
        }
        if (curSelectLesson && isNoSameLecture && isTimeAvailable && isUnderMaxCredit) {
            connection.query(myLessonQuery, [lec_num], function(err3, my_lesson) {
                if (err3) {
                    console.log(err3);
                }
                curSelectLesson[0] = curSelectLesson[0].replace(" ", my_lesson[0].lec_num);
                curSelectLesson[1] = curSelectLesson[1].replace(" ", my_lesson[0].lec_name);
                curSelectLesson[2] = curSelectLesson[2].replace(" ", stu_id);
                curSelectLesson[3] = curSelectLesson[3].replace(" ", my_lesson[0].credit);
                //console.log(curSelectLesson);
                console.log(information);
                connection.query(TakeLessonQuery, curSelectLesson, function(err, next) {
                    if (err) {
                        console.log(err);
                    }
                    res.redirect("back");
                });
            });

        }
        else {
            res.send("<script>alert('Unexpected Error');history.back();</script>");
        }
        if (connection) {
            return connection.release();
        }

    });
});

app.get('/enroll/selectandshow/:lec_num', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        var lec_num = req.params.lec_num;
        var selandshowQuery = "select lec_num,lec_name,location,credit,major_minor from lecture_info where lec_num =?";
        var underQuery = "SELECT * FROM enrolled_list WHERE stu_id=?";
        var selAndShow = [];
        var en_array = [];
        var stu_id = req.session.user.id;
        var stu_name = req.session.user.name;
        if (lec_num) {
            connection.query(selandshowQuery, [lec_num], function(err, shenr_row) {
                connection.query(underQuery, [req.session.user.id], function(err, enr_row) {
                    if (err) console.error("err : " + err);
                    // console.log(enr_row);
                    for (var i = 0; i < shenr_row.length; i++) {
                        if (shenr_row[i].major_minor == 1) shenr_row[i].major_minor = "전공";
                        else shenr_row[i].major_minor = "교양";
                    }
                    if (err) console.error("err : " + err);
                    // console.log(enr_row);
                    for (var i = 0; i < enr_row.length; i++) {
                        if (enr_row[i].major_minor == 1) enr_row[i].major_minor = "전공";
                        else enr_row[i].major_minor = "교양";
                    }
                    res.render('enroll', {
                        title: "수강 신청",
                        sh_enr_row: shenr_row,
                        enr_row: enr_row,
                        stu_id: stu_id,
                        stu_name: stu_name
                    });
                    connection.release();
                });
            });
        }
        else {
            res.send("<script>alert('원하시는 과목을 선택해주세요');history.back();</script>");
            connection.release();
        }
    });
});
app.get('/', function(req, res, next) {
    pool.getConnection(function(err, connection) {
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
            connection.query(stunameSQL, [req.session.user.id], function(err, row) {
                connection.query(deansList, function(err, rows) {
                    connection.query(Timetable, [req.session.user.id], function(err, table) {
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
                            professor[num1][num2] = professor[num1][num2].replace(" ", table[i].professor);
                            location[num1][num2] = location[num1][num2].replace(" ", "(" + table[i].location + ")");
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
                            professor[num1][num2] = professor[num1][num2].replace(" ", table[i].professor);
                            location[num1][num2] = location[num1][num2].replace(" ", "(" + table[i].location + ")");
                            color[num1][num2] = i;
                        }
                        console.log("Result: ", lec_name);
                        res.render('index', {
                            title: '메인 화면',
                            row: row[0],
                            rows: rows,
                            lec_name: lec_name,
                            professor: professor,
                            location: location
                        });
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
app.post('/logout', function(req, res) {
    delete req.session.user;
    req.session.save(() => {
        res.redirect('/login');
    });
});

app.post('/enroll/drop', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        var dropSQL = "DELETE FROM class_info WHERE stu_id = ? and lec_num = ?";
        console.log(req.body.lesson_selected, req.session.user.id);
        connection.query(dropSQL, [req.session.user.id, req.body.lesson_selected], function(err, result) {
            res.redirect("back");

        });
    });
});
module.exports = app;
