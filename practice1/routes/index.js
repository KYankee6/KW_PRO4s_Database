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

app.get('/', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        //Use the connection
        var stunameSQL = "SELECT stu_name FROM register_info WHERE ID=?";
        var deansList = "SELECT * FROM ranking WHERE open_date='2020-03-01'";
        var Timetable = "SELECT * FROM current_time_table WHERE stu_id = ?";
        var lec_name = new Array(6);
        var professor = new Array(6);
        var timeStamp = new Array(6);
        var color = new Array(6);
        for (var i = 0; i < 6; i++) {
            lec_name[i] = new Array(5);
            professor[i] = new Array(5);
            timeStamp[i] = new Array(5);
            color[i] = new Array(5);
            for (var j = 0; j < 5; j++) {
                lec_name[i][j] = " ";
                professor[i][j] = " ";
                timeStamp[i][j] = " ";
                color[i][j] = 0;
            }
        }
        console.log(lec_name);
        if (req.session.user) {
            console.log(req.session.user);
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
                            timeStamp[num1][num2] = timeStamp[num1][num2].replace(" ",  "("+table[i].time_stamp+")");
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
                            timeStamp[num1][num2] = timeStamp[num1][num2].replace(" ",  "("+table[i].time_stamp+")");
                            color[num1][num2] = i;
                        }

                        console.log("Result: ", lec_name);
                        res.render('index', { title: '메인 화면', row: row[0], rows: rows, lec_name: lec_name, professor:professor, timeStamp:timeStamp });
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
