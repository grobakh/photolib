var express = require('express');
var router = express.Router();
var debug = require('debug')('myvocab:index-router');

router.get('/', function (req, res) {
    debug('render index');
    res.render('index', {title: 'Express'});
});

module.exports = router;
