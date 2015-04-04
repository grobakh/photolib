var express = require('express');
var router = express.Router();
var debug = require('debug')('photolib:index-router');

router.get('/', function (req, res) {
    debug('user locale: ' + req.getLocale());
    res.render('index');
});

module.exports = router;
