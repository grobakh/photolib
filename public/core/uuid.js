(function (angular, window) {

  var neatUidObject = {
    new: function () {
      var now = new Date().getTime();
      now += Math.pow(10, 13) * Math.floor((Math.random() * 100) + 1);
      return now.toString(36);
    },
    parse: function (neatUid) {
      return new Date(parseInt(neatUid, 36) % Math.pow(10, 13));
    }
  };

  if (angular) {
    angular.module('yf.services', []).factory('neatUid', function () {
      return neatUidObject;
    });
  }

  window.neatUid = neatUidObject;

}(angular, window));