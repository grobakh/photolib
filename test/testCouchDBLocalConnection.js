var prefix = 'test_';
var albumsDb = require("../data/albumsDb")(prefix);
var nano = require('nano')('http://localhost:5984');
var data = require('./testpenter.json');
var couchpenter = new (require('couchpenter'))("http://localhost:5984",
  {setupFile: 'test/testpenter.json', prefix: prefix});
var debug = require('debug')('photolib:test');


exports["test CouchDB Local Connection"] = {
  setUp: function (callback) {
    couchpenter.reset(function (error, results) {
      if (error) {
        throw error;
      }

      callback();
    });
  },

  //tearDown: function (callback) {
  //  couchpenter.tearDown(function (error, results) {
  //    if (error) {
  //      throw error;
  //    }
  //
  //    debug("tearDown");
  //    callback();
  //  });
  //},

  "test db data": function (test) {
    test.ok(data);
    test.ok(data.albums);
    test.ok(data.albums);
    test.equal(data.albums[0]._id, "albums");
    test.ok(data.albums[0].tree);
    test.done();
  },

  "connect to _users": function (test) {
    nano.db.get('_users', function (err) {
      test.ok(!err);
      test.done();
    });
  },

  "connect to albums": function (test) {
    albumsDb.readTree(function (err) {
      throw new Error(err);
    }, function (data) {
      test.ok(data);
      test.done();
    });
  },

  "update albums": function (test) {
    albumsDb.readTree(function (err) {
      throw new Error(err);
    }, function (tree) {
      albumsDb.saveTree(tree, function (err) {
        throw new Error(err);
      }, function (rev) {
        test.ok(rev);
        test.done();
      });
    });
  },

  "undo": function (test) {
    albumsDb.readTree(function (err) {
      throw new Error(err);
    }, function (tree) {
      tree[0].label = "save1";
      albumsDb.saveTree(tree, function (err) {
        throw new Error(err);
      }, function (rev) {
        albumsDb.undo(rev, function (err) {
          throw new Error(err);
        }, function (rev) {
          albumsDb.readTree(function (err) {
            throw new Error(err);
          }, function (undoTree) {
            test.equals(undoTree[0].label, "bar");
            test.done();
          });
        });
      });
    });
  },

  "no undo": function (test) {
    albumsDb.readTree(function (err) {
      throw new Error(err);
    }, function (tree) {
      tree[0].label = "save_no_1";
      albumsDb.saveTree(tree, function (err) {
        throw new Error(err);
      }, function (rev1) {
        tree[0].label = "save_no_2";
        albumsDb.saveTree(tree, function (err) {
          throw new Error(err);
        }, function (rev2) {
          albumsDb.undo(rev1, function (err) {
            test.equal(err, "PL_CANCEL_NOT_LATEST_REVISION");

            albumsDb.readTree(function (err) {
              throw new Error(err);
            }, function (unrestoredTree) {
              test.equals(unrestoredTree[0].label, "save_no_2");
              test.done();
            });
          }, function (rev) {
          });
        });
      });
    });
  }
};