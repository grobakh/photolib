var express = require('express');
var router = express.Router();
var debug = require('debug')('photolib:index-router');
var albumsDb = require("../data/albumsDb")();
var _ = require("underscore");

router.get('/', function (req, res) {
  albumsDb.readTree(function (err) {
    throw new Error(err);
  }, function (albumTree) {
    res.render('index', {title: res.__("manageAlbums"), albumTree: albumTree});
  });
});

router.get('/photos/:albumId', function (req, res, next) {
  albumsDb.readTree(function (err) {
    throw new Error(err);
  }, function (albumTree) {

    debug("photos router");

    var albumId = req.params.albumId;
    var candidate = _(albumTree).find(function (element) {
      return element.id === albumId;
    });

    if (candidate) {
      res.render('index', {
        title: res.__(candidate.label),
        albumTree: candidate.children || []
      });
    } else {
      next();
    }
  });
});

module.exports = router;
