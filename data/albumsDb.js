var debug = require('debug')('photolib:albumsDb');
var db = require('nano')('http://localhost:5984');

debug("start albumsDb");


module.exports = function (prefix) {
  debug("module constructor function");

  var albumsDb = db.use(prefix + "albums");

  return {
    readTree: function (callback) {
      albumsDb.get("albumTree", function (err, albumTree) {
        callback(albumTree.tree);
      });
    },

    saveTree: function (newTree, callback) {
      albumsDb.get("albumTree", function (err, albumTree) {
        albumTree.tree = newTree;
        albumsDb.insert(albumTree, function () {
          callback();
        });
      });
    }
  };
};