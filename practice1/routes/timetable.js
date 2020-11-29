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


app.get('/', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        //Use the connection
        var stunameSQL = "SELECT stu_name FROM register_info WHERE ID=?";
        var Timetable = "SELECT * FROM current_time_table natural join lecture_info WHERE stu_id = ?";
        var locationQuery = "SELECT DISTINCT location FROM current_time_table";
        var professor = new Array(6);
        var location = new Array(6);
        var lec_num = new Array(6);
        var lec_name = new Array(6);
        var phone = new Array(6);
        for (var i = 0; i < 6; i++) {
            lec_name[i] = new Array(5);
            professor[i] = new Array(5);
            location[i] = new Array(5);
            lec_num[i] = new Array(5);
            phone[i] = new Array(5);
            for (var j = 0; j < 5; j++) {
                lec_name[i][j] = " ";
                professor[i][j] = " ";
                location[i][j] = " ";
                lec_num[i][j] = " ";
                phone[i][j] = " ";
            }
        }
        console.log(lec_name);
        if (req.session.user) {
            console.log(req.session.user);
            connection.query(locationQuery, function(err, loc) {
                connection.query(stunameSQL, [req.session.user.id], function (err, row) {
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
                                console.log(num2, num1, table[i].time_stamp);
                                lec_name[num1][num2] = lec_name[num1][num2].replace(" ", table[i].lec_name);
                                professor[num1][num2] = professor[num1][num2].replace(" ",  table[i].professor);
                                location[num1][num2] = location[num1][num2].replace(" ",  "("+table[i].location+")");
                                lec_num[num1][num2] = lec_num[num1][num2].replace(" ", table[i].lec_num);
                                phone[num1][num2] = phone[num1][num2].replace(" ", table[i].professor_phone);
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
                                lec_num[num1][num2] = lec_num[num1][num2].replace(" ", table[i].lec_num);
                                phone[num1][num2] = phone[num1][num2].replace(" ", table[i].professor_phone);
                            }

                        console.log("Result: ", lec_num);
                        res.render('timetable', { title: '시간표', row: row[0], lec_name: lec_name, professor:professor, location:location, loc:loc, lec_num:lec_num, phone:phone});
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

app.get('/location/:page', function (req, res, next) {
    const url = req.params.page;
    console.log("Hey!!!!");
    pool.getConnection(function (err, connection) {
        var loc_timetable = "select * from lectureroom_time_table where open_date = '2020-03-01' and location=?";
        var stunameSQL = "SELECT stu_name FROM register_info WHERE ID=?";
        var locationQuery = "SELECT DISTINCT location FROM current_time_table";
        var lec_name = new Array(6);
        var professor = new Array(6);
        var phone = new Array(6);
        var stu_name = [];
        for (var i = 0; i < 6; i++) {
            lec_name[i] = new Array(5);
            professor[i] = new Array(5);
            phone[i] = new Array(5);
            for (var j = 0; j < 5; j++) {
                lec_name[i][j] = " ";
                professor[i][j] = " ";
                phone[i][j] = " ";
            }
        }
        if (req.session.user) {
            connection.query(locationQuery, function(err, locs) {
                if (err) console.error("err : " + err);
            connection.query(stunameSQL, [req.session.user.id], function (err, row) {
                stu_name = row[0].stu_name; 

            });
                connection.query(loc_timetable, url, function(err, table) {
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
                        console.log(num2, num1, table[i].time_stamp);
                        lec_name[num1][num2] = lec_name[num1][num2].replace(" ", table[i].lec_name);
                        professor[num1][num2] = professor[num1][num2].replace(" ",  table[i].professor);
                        phone[num1][num2] = phone[num1][num2].replace(" ", table[i].professor_phone);
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
                        phone[num1][num2] = phone[num1][num2].replace(" ", table[i].professor_phone);
                    }


                    res.render('location', { title: '강의실', stu_name:stu_name, lec_name: lec_name, professor:professor, url:url, locs:locs, phone:phone});
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

app.post('/logout', function (req, res) {
    delete req.session.user;
    req.session.save(() => {
        res.redirect('/login');
    });
});
module.exports = app;
