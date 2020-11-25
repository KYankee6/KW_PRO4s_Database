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
        
        var Timetable = "SELECT * FROM current_time_table WHERE stu_id = ?";
        var array = new Array(6);
        for (var i = 0; i < 6; i++) {
            array[i] = new Array(5);
            for (var j = 0; j < 5; j++) {
                array[i][j] = " ";
            }
        }

        if (req.session.user) {
            console.log(req.session.user);
            connection.query(Timetable, [req.session.user.id], function (err, row) {
                
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
                    array[num1][num2] = array[num1][num2].replace(" ", table[i].lec_name + "\n" + table[i].professor + "(" + table[i].time_stamp + ")");
                }
                console.log(array);
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
                    array[num1][num2] = array[num1][num2].replace(" ", table[i].lec_name + "\n" + table[i].professor + "(" + table[i].time_stamp + ")");
                }

                res.render('timetable', { title: '시간표', array:array});
                connection.release();
            });
        }
    });
});