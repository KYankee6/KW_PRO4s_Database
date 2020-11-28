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

router.post('/', join_image.single('image'), (req, res) => {
  var id = req.body.id;
  var passwd = req.body.passwd;
  var stu_name = req.body.name;
  var email = req.body.email;
  var address = req.body.address;
  var RRN = req.body.RRN;
  if (req.file)
    var image = cur;
  else
    var image = "";
  var datas = [id, passwd, stu_name, email, address, RRN, image];
  pool.getConnection(function (err, connection) {
    var sqlForInsertBoard = "insert into register_info(id, passwd, stu_name, email, address, RRN, image) values(?,?,?,?,?,?,?)";
    connection.query(sqlForInsertBoard, datas, function (err, rows) {
      if (err) {
        if (err.code == "ER_NO_REFERENCED_ROW_2")
          res.send("<script>alert('존재하지 않는 학번입니다.');history.back();</script>");
        else if (err.code == "ER_DUP_ENTRY")
          res.send("<script>alert('이미 가입되어 있는 학번이나 주민번호입니다.');history.back();</script>");
      }
      else {
        console.log("rows : " + JSON.stringify(rows));
        res.redirect('/joinForm');
      }
      connection.release();
    });
  });
});

router.get('/join_image', function (req, res) {
  res.render('join_image');
});

router.get('/', function (req, res) {
  res.render('joinForm', { title: '회원가입' });
});

module.exports = router;