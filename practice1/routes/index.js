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
    res.redirect('/index');
});
router.get('/index', function(req,res,next) {
    pool.getConnection(function (err, connection) {
        // Use the connection
        var stunameSQL = "SELECT stu_name FROM register_info WHERE ID='2016722066'";
        var deansList = "SELECT * FROM ranking WHERE open_date='2020-03-01'";
        var Timetable = "SELECT select * from current_time_table where stu_id = '2016722066'";
        
        connection.query(stunameSQL, function (err, row) {
            if (err) console.error("err : " + err);
            console.log("name rows : " + JSON.stringify(row));
            connection.query(deansList, function(err, rows) {
                if (err) console.error("err : " + err);
            
            res.render('index', {title: '메인 화면', row:row[0], rows:rows});
            connection.release();
            });
            // Don't use the connection here, it has been returned to the pool.
        });
        
    });
});

module.exports = router;