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
        var Timetable = "SELECT * FROM current_time_table WHERE stu_id = '2016722066'";
        console.log(req.session.user);
        connection.query(stunameSQL, [req.session.user.id], function (err, row) {
            connection.query(deansList, function (err, rows) {
                connection.query(Timetable, function (err, table) {
                    if (err) console.error("err : " + err);

                    res.render('index', { title: '메인 화면', row: row[0], rows: rows, table: table });
                    connection.release();
                });
                if (err) console.error("err : " + err);
            });
            if (err) console.error("err : " + err);
            //Don't use the connection here, it has been returned to the pool.
        });

    });
});

// app.post('/logout', function (req, rsp) {
//     delete req.session.uid;
//     delete req.session.isLogined;
//     delete req.session.author_id;

//     req.session.save(function () {
//         rsp.redirect('/');
//     });
// })
module.exports = app;