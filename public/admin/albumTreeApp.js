(function () {
  var albumTreeApp = angular.module('albumTreeApp', ['angularTreeview']);

  albumTreeApp.controller('treeController', ["$scope", "$http",
    function ($scope, $http) {
      $scope.addFolder = function () {
        var selectedChildren = $scope.albumTree;

        if ($scope.albums.currentNode) {
          if (!$scope.albums.currentNode.isLeaf) {
            $scope.albums.currentNode.children = $scope.albums.currentNode.children || [];
            $scope.albums.currentNode.collapsed = false;
            selectedChildren = $scope.albums.currentNode.children;
          } else {
            return;
          }
        }

        selectedChildren.push({label: "undefined", isLeaf: false});
      };

      $scope.addAlbum = function () {
        var selectedChildren = $scope.albumTree;

        if ($scope.albums.currentNode) {
          if (!$scope.albums.currentNode.isLeaf) {
            $scope.albums.currentNode.children = $scope.albums.currentNode.children || [];
            $scope.albums.currentNode.collapsed = false;
            selectedChildren = $scope.albums.currentNode.children;
          } else {
            return;
          }
        }

        selectedChildren.push({label: "undefined", isLeaf: true});
      };

      $scope.saveChanges = function () {
        $http.post('/admin/manageAlbums/saveChanges', {albumTree: $scope.albumTree}).
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