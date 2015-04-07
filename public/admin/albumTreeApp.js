(function () {

  var albumTreeApp = angular.module('albumTreeApp', ['angularTreeview']);

  albumTreeApp.controller('treeController', ["$scope", "$http",
    function ($scope, $http) {

      $scope.albums = [
        {
          "label": "User",
          "id": "324324234453543",
          "children": [
            {"label": "subUser1", "id": "456234234765", "children": []}
          ]
        },

        {"label": "Admin", "id": "6786745645", "children": [], isFolder: true},

        {"label": "Guest", "id": "34578678455645", "children": [], isFolder: false}
      ];

      $scope.saveChanges = function () {
        $http.post('/admin/manageAlbums/saveChanges', {albums: $scope.albums}).
          success(function (data) {
            var paramStr = _.getURIparams(data);
            window.location = ("/admin/manageAlbums/success?" + paramStr);
          }).
          error(function (data, status, headers, config) {
            alert(data);
          });
      };

    }]);
}());