var express = require('express');
var router = express.Router();

var mysql = require('Database2');
var pool = mysql.createConnection({
    connectionLimit: 5,
    host: 'localhost',
    user: 'root',
    database: 'Database2',
    password: 'chickrush'
})

router.get('/index', function(req,res,next) {
    pool.getConnection(function (err, connection) {
        // Use the connection
        var sqlForSelectList = "SELECT stu_name FROM student_info where stu_id='2016722066";
        connection.query(sqlForSelectList, function (err, rows) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));

            res.render('list', {title: '메인 화면', rows: rows});
            connection.release();

            // Don't use the connection here, it has been returned to the pool.
        });
    });
});

module.exports = router;