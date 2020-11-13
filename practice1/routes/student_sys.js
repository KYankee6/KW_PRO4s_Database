var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 5,
    host: 'localhost',
    user: 'root',
    database: 'database2',
    password: 'chickrush'
})

router.get('/', function(req, res, next) {
    res.redirect('/main/');
});

router.get('/main/', function(req,res,next) {

    pool.getConnection(function (err, connection) {
        // Use the connection
        var sqlForSelectList = "SELECT * FROM student_info where stu_id='2016722066";
        connection.query(sqlForSelectList, function (err, rows) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));

            res.render('list', {title: '메인 페이지', rows: rows});
            connection.release();

            // Don't use the connection here, it has been returned to the pool.
        });
    });
});

module.exports = router;