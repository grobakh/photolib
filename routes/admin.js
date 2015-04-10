var express = require('express');
var router = express.Router();
var debug = require('debug')('photolib:admin-router');
var albumsDb = require("../data/albumsDb")();


router.get('/', function (req, res) {
  res.render('admin', {title: res.__("adminDashboard")});
});

router.get('/manageAlbums', function (req, res) {
  albumsDb.readTree(function (err) {
    throw new Error(err);
  }, function (albumTree) {
    res.render('admin-manageAlbums', {title: res.__("manageAlbums"), albumTree: albumTree});
  });
});

router.post('/manageAlbums/saveChanges', function (req, res) {
  var albumTree = req.param('albumTree');
  albumsDb.saveTree(albumTree, function (err) {
    throw new Error(err);
  }, function (rev, oldTree, newTree) {
    var result = {albumsRemoved: 0, photosRecovery: 0, rev: rev};
    res.send(result);
  });
});

router.get('/manageAlbums/success', function (req, res) {
  res.render('admin-manageAlbums-success', {
    title: res.__("manageAlbums"),
    albumsRemoved: req.param('albumsRemoved'),
    photosRecovery: req.param('photosRecovery'),
    rev: req.param('rev')
  });
});

router.get('/manageAlbums/cancel/:rev', function (req, res) {
  albumsDb.undo(req.param('rev'), function (err) {
    if (err === "PL_CANCEL_NOT_LATEST_REVISION") {
      res.redirect('/admin/manageAlbums/cannotCancel');
    }
    else {
      throw new Error(err);
    }
  }, function () {
    res.redirect('/admin/manageAlbums');
  });
});

module.exports = router;
