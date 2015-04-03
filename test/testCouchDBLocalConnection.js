var nano = require("nano")('http://localhost:5984');

exports["test CouchDB Local Connection"] = {
    "connect to _users" : function (test) {
        nano.db.get('_users', function (err) {
            test.ok(!err);
            test.done();
        });
    }
};