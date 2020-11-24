var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 5,
    host: '223.194.46.205',
    user: 'root',
    database: 'database2',
    password: 'pro4spro4s!'
});
router.get('/', function(req, res, next) {
    res.redirect('/login');
});
router.get('/index', function(req,res,next) {
    pool.getConnection(function (err, connection) {
        // Use the connection
        var stunameSQL = "SELECT stu_name FROM register_info WHERE ID='2016722066'";
        var deansList = "SELECT * FROM ranking WHERE open_date='2020-03-01'";
        var Timetable = "SELECT * FROM current_time_table WHERE stu_id = '2016722066'";
        
        connection.query(stunameSQL + deansList + Timetable, )
        
    });
});
/*
router.get('/index', function(req,res,next) {
    pool.getConnection(function (err, connection) {
        // Use the connection
        var stunameSQL = "SELECT stu_name FROM register_info WHERE ID='2016722066'";
        var deansList = "SELECT * FROM ranking WHERE open_date='2020-03-01'";
        var Timetable = "SELECT * FROM current_time_table WHERE stu_id = '2016722066'";
        
        connection.query(stunameSQL, function (err, row) {
            connection.query(deansList, function(err, rows) {
                connection.query(Timetable, function(err, table) {
                    if (err) console.error("err : " + err);
                
                    res.render('index', {title: '메인 화면', row:row[0], rows:rows, table:table});
                    connection.release();
                });
                if (err) console.error("err : " + err);
            });
            if (err) console.error("err : " + err);
            // Don't use the connection here, it has been returned to the pool.
        });
        
    });
});
*/
module.exports = router;