(function () {

  var albumTreeApp = angular.module('albumTreeApp', ['angularTreeview']);

  albumTreeApp.controller('treeController', function ($scope) {

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

  });
}());