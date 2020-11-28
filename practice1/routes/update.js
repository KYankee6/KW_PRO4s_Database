var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')

var multer = require('multer'); // 이미지
var path = require('path'); // 이미지

var mysql = require('mysql');
const app = require('../app');
var pool = mysql.createPool({
    connectionLimit: 5,
    host: '223.194.46.205',
    user: 'root',
    port: 3306,
    database: 'database2',
    password: 'pro4spro4s!'
});

var join_image = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'join_images/');
        },
        filename: function (req, file, cb) {
            cb(null, cur = file.originalname);
        }
    }),
});

router.get('/', join_image.single('image'), (req, res) => {
    var id = req.query.id;
    var passwd = req.query.passwd;
    var stu_name = req.query.stu_name;
    var email = req.query.email;
    var address = req.query.address;
    var RRN = req.query.RRN;
    pool.getConnection(function (err, connection) {
        if (err) console.error("커넥션 객체 얻어오기 에러 : ", err);
        var sqlForReadBoard = "select id, passwd, stu_name, email, address, RRN from register_info where id = '2016722066'";
        connection.query(sqlForReadBoard, [id, passwd, stu_name, email, address, RRN], function (err, rows) {
            if (err) console.error(err);
            res.render('update', { title: "회원정보수정", rows: rows[0]});
            connection.release();
        });
    });
});

router.post('/', join_image.single('image'), (req, res) => {
    var passwd = req.body.passwd;
    var email = req.body.email;
    var address = req.body.address;
    if (req.file)
        var image = cur;
    else
        var image = "";
    var datas = [passwd, email, address, image];
    pool.getConnection(function (err, connection) {
        var sqlForUpdateBoard = "update register_info set passwd=?, email=?, address=?, image=? where id = '2016722066'";
        connection.query(sqlForUpdateBoard, datas, function (err, rows) {
            if (err) console.log("에러에러에러에러ㅔㅇ러ㅔㅇ러");
            else {
                console.log("rows : " + JSON.stringify(rows));
                res.redirect('/update');
            }
            connection.release();
        });
    });
});

router.get('/join_image', function (req, res) {
    res.render('join_image');
});

router.get('/', function (req, res) {
    res.render('update', { title: '개인정보수정' });
});

module.exports = router;