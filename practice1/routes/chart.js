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
  res.render('chart', {title: "차트"});
});

module.exports = router;