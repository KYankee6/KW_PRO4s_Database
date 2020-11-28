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
    password: 'pro4spro4s!'
});

var options = {
    connectionLimit: 20,
    host: '223.194.46.205',
    port: 3306,
    database: 'database2',
    user: 'root',
    password: 'pro4spro4s!'
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
    pool.getConnection(function (err, connection) {
        var stunameSQL = "SELECT stu_name FROM register_info WHERE ID=?";
        var friendlistSQL = "SELECT s.stu_id as stu_id, s.stu_name as stu_name, s.major as major FROM friend_list as f, student_info as s WHERE f.src_id = ? and s.stu_id = f.dst_id;";
        var stu_name = [];
        connection.query(stunameSQL, [req.session.user.id], function (err, row) {
            if (err) console.error("err : " + err);
            stu_name = row[0].stu_name;
        });
        connection.query(friendlistSQL, [req.session.user.id], function (err, rows) {
            if (err) console.error("err : " + err);
            res.render('friend', { title: 'Friend List', stu_name:stu_name, rows:rows});
            connection.release();
        });
    });
});

app.post('/', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        var findFriendSQL = "select * from register_info where ID = ?";
        var duplicatedSQL = "SELECT * FROM friend_list WHERE src_id = ? and dst_id = ?";
        var addFriendSQL = "insert into friend_list (src_id, dst_id) values(?, ?)";
        if (!req.body.stu_id) {
            res.send("<script>alert('아이디를 입력하세요.');history.back(-1);</script>");
        }
        else {
            console.log("src_id", req.session.user.id);
            console.log("dst_id", req.body.stu_id);
            connection.query(duplicatedSQL, [req.session.user.id, req.body.stu_id], function(duperr, isdup) {
                if(duperr) console.log("err: ", duperr);
                if (isdup.length > 0) {
                    res.send("<script>alert('우린 이미 친구입니다!');history.back(-1);</script>");
                    res.end();
                }
                else {
                    connection.query(findFriendSQL, req.body.stu_id, function (error, results) {
                        if (error) {
                            console.error("err: " + error);
                            console.log(results);
                        }
                        else if (results.length > 0) {
                            connection.query(addFriendSQL, [req.session.user.id, req.body.stu_id], function(err, ins) {
                                console.log("inserted ", req.session.user.id, "-> ", req.body.stu_id);
                                res.redirect('/friend');
                            });
                        }
                        else {
                            res.send("<script>alert('아이디를 확인하세요.(ID: 학번)');history.back(-1);</script>");
                            res.end();
                        }
                    });
                }
            });
        }
    });
});

app.get('/:page', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        //Use the connection
        const url = req.params.page;
        var stunameSQL = "SELECT stu_name FROM register_info WHERE ID=?";
        var friendinfoSQL = "SELECT stu_name FROM register_info WHERE ID=?";
        var Timetable = "SELECT * FROM current_time_table WHERE stu_id = ?";
        var friendInfo = [];
        var professor = new Array(6);
        var location = new Array(6);
        var color = new Array(6);
        var lec_name = new Array(6);
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
            console.log(req.session.user);
            connection.query(friendinfoSQL, [url], function (err, row) {
                friendInfo = row[0];
            });
                connection.query(stunameSQL, [req.session.user.id], function (err, row) {
                        connection.query(Timetable, [url], function (err, table) {
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
                        res.render('friend_timetable', { title: '친구 시간표', row: row[0], lec_name: lec_name, professor:professor, location:location, url:url, friendInfo:friendInfo});
                        connection.release();
                    });
                    if (err) console.error("err : " + err);
                    //Don't use the connection here, it has been returned to the pool.
            });
        }
        else {
            res.send("<script>alert('만료된 세션');history.back();</script>");
            connection.release();
        }
    });
});


app.post('/delete/:page', function (req, res) {
    const url = req.params.page;
    pool.getConnection(function (err, connection) {
        var deleteFriend = "DELETE FROM friend_list WHERE src_id = ? and dst_id = ?";
        connection.query(deleteFriend, [req.session.user.id, url], function(err, result) {
            if (err) console.log("err : ", err);
            res.redirect('/friend');
            
        });
    });
});

module.exports = app;
