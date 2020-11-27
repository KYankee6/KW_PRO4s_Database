var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')

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

router.get('/', function (req, res) {
  res.render('find_passwd', {title: "Password 찾기"});
});

router.post('/', (req, res) => {
  var id = req.body.id;
  var stu_name = req.body.stu_name;
  var RRN = req.body.RRN;
  pool.getConnection(function (err, connection) {
    var sqlForInsertBoard = "select passwd from register_info where stu_name=? and RRN=? and id=?";
    connection.query(sqlForInsertBoard, [stu_name, RRN, id], function (err, rows) {
      if (!rows[0]) {
        res.send("<script>alert('학생정보가 존재하지 않습니다.');history.back();</script>");
      }
      else res.render('find_passwd',{title: "Password 찾기", result:rows[0]});
      console.log([stu_name, RRN, id]);
      console.log(rows[0]);
      connection.release();
    });
  });
});

module.exports = router;