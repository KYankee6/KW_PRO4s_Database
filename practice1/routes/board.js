var express = require('express');
var router = express.Router();
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var cookieParser = require('cookie-parser');
//var passport = require('./config/passport');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 6,
    host: '223.194.46.205',
    user: 'root',
    port: 3306,
    database: 'database2',
    password: 'pro4spro4s!',
    dateStrings:'date'
});


var options = {
    connectionLimit: 20,
    host: '223.194.46.205',
    port: 3306,
    database: 'database2',
    user: 'root',
    password: 'pro4spro4s!',
    dateStrings:'date'
};


var app = express();

const { request, response } = require('../app');
var sessionStore = new MySQLStore(options);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    store: sessionStore
}));

app.get('/', function (req, res, next) {
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
app.get('/list/:page', function (req, res, next) {
    //var name = req.params.name;
    const url = req.params.page;
    //console.log(url);
    pool.getConnection(function (err, connection) {
        var getLecsQuery = "select lec_name,lec_num from board_information where stu_id = ?";
        var getBoardContentQuery = "select * from board_content where lec_num =? and stu_id = ? order by star DESC";
        var stunameSQL = "SELECT stu_name FROM register_info WHERE ID=?";
        var stu_name = [];
        if (req.session.user) {
            connection.query(stunameSQL, [req.session.user.id], function (err, row) {
                stu_name = row[0].stu_name;
                console.log('이름이뭐에요?', row);
            });
            //var classname = "select L.lec_name from lecture_info as L, class_info as C where L.lec_num = C.lec_num and C.grade is null and C.stu_id = '2016722066'"
            connection.query(getLecsQuery, [req.session.user.id], function (err, lectures) {
                if (err) console.error("err : " + err);
                //console.log("rows : " + JSON.stringify(rows));
                connection.query(getBoardContentQuery, [url, req.session.user.id], function (err, content) {
                    console.log(content);

                    res.render('list', { title: '공지 및 자료', stu_name:stu_name, lecs: lectures, contents: content, url:url });
                });
                connection.release();
            });
        }
        else {
            res.send("<script>alert('만료된 세션');history.back();</script>");
            connection.release();
        }
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


app.get('/read/:idx', function (req, res, next) {
    const idx = req.params.idx;
    pool.getConnection(function (err, connection) {
        var sql = "select idx, title, writer, write_date, star, file_name, content, hit, L.lec_name from board as B, lecture_info as L where B.lec_num = L.lec_num"
        var hitp = "update board set hit = hit + 1 where idx=?";
        var stunameSQL = "SELECT stu_name FROM register_info WHERE ID=?";
        var stu_name = [];
        if (req.session.user) {
            connection.query(stunameSQL, [req.session.user.id], function (err, row) {
                stu_name = row[0].stu_name;
            });
            connection.query(sql, [req.session.user.id], function (err, row) {
                if (err) console.error(err);
                console.log("1개 글 조회 결과 확인 : ", row);
                res.render('read', { title: "공지 및 자료", row: row[Number(idx.replace(":", "")) - 1], stu_name:stu_name});
                connection.release();
            });
            connection.query(hitp, [req.session.user.id], function (req, row) {
                console.log("조회수 올라간다");
            });
        }
        else {
            res.send("<script>alert('만료된 세션');history.back();</script>");
            connection.release();
        }
    });
});

//파일 다운로드
app.get("/download/:name", function (req, res, next) {
    const name = req.params.name;
    res.download(`./file/${name.replace(":", "")}`);
});


app.post('/logout', function (req, res) {
    delete req.session.user;
    req.session.save(() => {
        res.redirect('/login');
    });
});

//function star_sort
module.exports = app;