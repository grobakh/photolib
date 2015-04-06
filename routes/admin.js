var express = require('express');
var router = express.Router();
var debug = require('debug')('photolib:admin-router');

router.get('/', function (req, res) {
    res.render('admin', { title : res.__("adminDashboard")});
});

router.get('/manageAlbums', function (req, res) {
    res.render('admin-manageAlbums', { title : res.__("manageAlbums")});
});

module.exports = router;
