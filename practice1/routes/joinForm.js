var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sned('joinForm.js Check');
});

module.exports = router;
