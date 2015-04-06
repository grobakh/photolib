var express = require('express');
var router = express.Router();
var debug = require('debug')('photolib:index-router');


router.get('/', function (req, res) {
    res.render('index', {title: res.__("indexTitle")});
});

module.exports = router;
