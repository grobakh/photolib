var prefix = 'test_';
var albumsDb = require("../data/albumsDb")(prefix);
var nano = require('nano')('http://localhost:5984');
var data = require('./testpenter.json');
var couchpenter = new (require('couchpenter'))("http://localhost:5984",
  {setupFile: 'test/testpenter.json', prefix: prefix});


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
  //    callback();
  //  });
  //},

  "test db data": function (test) {
    test.ok(data);
    test.ok(data.albums);
    test.ok(data.albums[0]);
    test.equal(data.albums[0]._id, "albumTree");
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
    albumsDb.readTree(function (data) {
      test.ok(data);
      test.done();
    });
  },

  "update albums": function (test) {
    albumsDb.readTree(function (data) {
      albumsDb.saveTree(data, function () {
        test.done();
      });
    });
  }
};