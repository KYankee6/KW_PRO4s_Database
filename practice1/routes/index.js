var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 5,
    host: 'localhost',
    user: 'root',
    database: 'Database2',
    password: 'chickrush'
})
router.get('/', function(req, res, next) {
    res.redirect('/index');
});
router.get('/index', function(req,res,next) {
    pool.getConnection(function (err, connection) {
        // Use the connection
        var sqlForSelectList = "SELECT stu_name FROM register_info where ID='2016722066'";
        connection.query(sqlForSelectList, function (err, row) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(row));
            
            res.render('index', {title: '메인 화면', row:row[0]});
            connection.release();

            // Don't use the connection here, it has been returned to the pool.
        });
    });
});

module.exports = router;