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

router.get('/', function (req, res, next) {
    res.redirect('/board/list/1');
});
/*
router.get('/list/:page', function(req,res,next){
    pool.getConnection(function (err, connection){  
        var boardSelectList = "SELECT idx, title, writer, write_date, star, hit from board where lec_num = '000-201801-007'";
        connection.query(boardSelectList, function (err, rows) {
            if(err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));
             
            res.render('list', {title: '공지 및 자료', rows: rows});
            connection.release();
        });
    });
});*/

//가짜 삭제할것
router.get('/list/:page', function (req, res, next) {
    //var name = req.params.name;
    const url = req.params.page;
    console.log(url);
    pool.getConnection(function (err, connection) {
        var getLecsQuery = "select lec_name,lec_num from board_information where stu_id = '2016722066'";
        var getBoardContentQuery = "select * from board_content where lec_num =? and stu_id = '2016722066'"; 
        var stunameSQL = "SELECT stu_name FROM register_info WHERE ID='2016722066'";
        var stu_name;
        connection.query(stunameSQL, function (err, row) {
            stu_name=row;
        });
        //var classname = "select L.lec_name from lecture_info as L, class_info as C where L.lec_num = C.lec_num and C.grade is null and C.stu_id = '2016722066'"
        connection.query(getLecsQuery, function (err, lectures) {
            if (err) console.error("err : " + err);
            //console.log("rows : " + JSON.stringify(rows));
            connection.query(getBoardContentQuery, [url] ,function(err, content){
                console.log(content);

                res.render('list', { title: '공지 및 자료', row:stu_name, lecs: lectures,  contents:content});
            });
            connection.release();
        });
    });
});
// router.get('/list/:page', function (req, res, next) {
//     //var name = req.params.name;
//     pool.getConnection(function (err, connection) {
//         var classboard = "select B.idx, B.title, B.writer, B.write_date, B.star, B.file_name, B.hit, L.lec_name from board as B, lecture_info as L, class_info as C where B.lec_num = L.lec_num and L.lec_num = C.lec_num and C.stu_id = '2016722066'";
//         //var classname = "select L.lec_name from lecture_info as L, class_info as C where L.lec_num = C.lec_num and C.grade is null and C.stu_id = '2016722066'"
//         connection.query(classboard, function (err, rows) {
//             if (err) console.error("err : " + err);
//             console.log("rows : " + JSON.stringify(rows));

//             res.render('list', { title: '공지 및 자료', rows: rows });
//             connection.release();
//         });
//     });
// });
    /*
router.get('/list/:idx', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        var classname = "select L.lec_name from lecture_info as L, class_info as C where L.lec_num = C.lec_num and C.grade is null and C.stu_id = '2016722066'"
        connection.query(classname, function (err, rows_name) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows_name));

            res.render('list', { title: '공지 및 자료', rows_name: rows_name });
            connection.release();
        });
    });
});*/

    
router.get('/read/:idx', function (req, res, next) {
    const idx = req.params.idx;
    pool.getConnection(function (err, connection) {
        var sql = "select idx, title, writer, write_date, star, file_name, content, hit, L.lec_name from board as B, lecture_info as L where B.lec_num = L.lec_num"
        var hitp = "update board set hit = hit + 1 where idx=?";

        connection.query(sql, [idx], function (err, row) {
            if (err) console.error(err);
            console.log("1개 글 조회 결과 확인 : ", row);
            res.render('read', { title: "공지 및 자료", row: row[Number(idx.replace(":", "")) - 1] });
            connection.release();
        });
        connection.query(hitp, [idx], function (req, row) {
            console.log("조회수 올라간다");
        });
    });
});

//파일 다운로드
router.get("/download/:name", function (req, res, next) {
    const name = req.params.name;
    res.download(`./file/${name.replace(":", "")}`);
});

module.exports = router;