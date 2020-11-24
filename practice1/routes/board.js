var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 6,
    host: '223.194.46.205',
    user: 'root',
    port: 3306,
    database: 'database2',
    password: 'pro4spro4s!' 
});

router.get('/', function(req, res, next){
    res.redirect('/board/list/1');
});

router.get('/list/:page', function(req,res,next){4
    pool.getConnection(function (err, connection){  
        var boardSelectList = "SELECT idx, title, writer, write_date, star, hit from board where lec_num = '000-201801-007'";
        connection.query(boardSelectList, function (err, rows) {
            if(err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));

            res.render('list', {title: '공지 및 자료', rows: rows});
            connection.release();
        });
    });
});

router.get('/read/:idx', function(req,res,next)
{
    var idx = req.params.idx;
    pool.getConnection(function(err,connection)
    {
        var sql = "SELECT idx, title, writer, write_date, content, file_name, hit from board where lec_num = '000-201801-007'";
        connection.query(sql,[idx], function(err,row)
        {
            if(err) console.error(err);
            console.log("1개 글 조회 결과 확인 : ",row);
            res.render('read', {title:"공지 및 자료", row:row[0]});
            connection.release();
        });
    });
});

module.exports = router;