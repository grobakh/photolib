var express = require('express');
var router = express.Router();
var debug = require('debug')('photolib:admin-router');

router.get('/', function (req, res) {
  res.render('admin', {title: res.__("adminDashboard")});
});

router.get('/manageAlbums', function (req, res) {
  res.render('admin-manageAlbums', {title: res.__("manageAlbums")});
});

router.post('/manageAlbums/saveChanges', function (req, res) {
  debug(req.param('albums'));
  res.send({albumsRemoved: 8, photosRecovery: 10});
});

router.get('/manageAlbums/success', function (req, res) {
  res.render('admin-manageAlbums-success', {
    albumsRemoved: req.param('albumsRemoved'),
    photosRecovery: req.param('photosRecovery')
  });
});

module.exports = router;
