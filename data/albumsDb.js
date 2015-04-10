var debug = require('debug')('photolib:albumsDb');
var db = require('nano')('http://localhost:5984');

debug("start albumsDb");

module.exports = function (prefix) {
  debug("module constructor function");

  var albumsDb = db.use(prefix + "albums");

  return {
    readTree: function (errCallback, callback) {
      albumsDb.get("albumTree", function (err, albumTree) {
        callback(albumTree.tree);
      });
    },

    saveTree: function (newTree, errCallback, callback) {
      albumsDb.get("albumTree", function (err, albumTree) {
        albumTree.tree = newTree;
        albumsDb.insert(albumTree, function (err, body) {
          callback(body.rev);
        });
      });
    },

    undo: function (rev, errCallback, callback) {
      albumsDb.get("albumTree", {revs: true}, function (err, albumTree) {
        var revs = albumTree._revisions.ids;

        if (revs.length > 1) {
          var latestRev = revs.length + '-' + revs[0];

          if (latestRev !== rev) {
            errCallback("PL_CANCEL_NOT_LATEST_REVISION");
            return;
          }

          var prevRev = (revs.length - 1) + '-' + revs[1];

          albumsDb.get("albumTree", {rev: prevRev}, function (err, restoredBody) {
            albumTree.tree = restoredBody.tree;
            albumsDb.insert(albumTree, function (err, body) {
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