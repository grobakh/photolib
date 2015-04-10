var debug = require('debug')('photolib:albumsDb');
var db = require('nano')('http://localhost:5984');

debug("start albumsDb");

module.exports = function (prefix) {
  debug("module constructor function");
  prefix = prefix || "";

  var albumsDb = db.use(prefix + "albums");

  return {
    readTree: function (errCallback, callback) {
      albumsDb.get("albums", function (err, albums) {
        callback(albums.tree);
      });
    },

    saveTree: function (newAlbumTree, errCallback, callback) {
      albumsDb.get("albums", function (err, albums) {
        var oldAlbumTree = albums.tree;
        albums.tree = newAlbumTree;
        albumsDb.insert(albums, function (err, body) {
          callback(body.rev, oldAlbumTree, newAlbumTree);
        });
      });
    },

    undo: function (rev, errCallback, callback) {
      albumsDb.get("albums", {revs: true}, function (err, albums) {
        var revs = albums._revisions.ids;

        if (revs.length > 1) {
          var latestRev = revs.length + '-' + revs[0];

          if (latestRev !== rev) {
            errCallback("PL_CANCEL_NOT_LATEST_REVISION");
            return;
          }

          var prevRev = (revs.length - 1) + '-' + revs[1];

          albumsDb.get("albums", {rev: prevRev}, function (err, restoredAlbums) {
            albums.tree = restoredAlbums.tree;
            albumsDb.insert(albums, function (err, body) {
              callback(body.rev);
            });
          });
        } else {
          errCallback("PL_CANCEL_NO_REVISIONS");
        }
      });
    }
  };
};