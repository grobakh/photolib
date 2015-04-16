(function () {
  var albumTreeApp = angular.module('albumTreeApp', ['angularTreeview']);

  albumTreeApp.controller('treeController', ["$scope", "$http",
    function ($scope, $http) {
      function findParent() {
        return null;
      }

      $scope.addFolder = function () {
        var selectedChildren = $scope.albumTree;

        if ($scope.albums.currentNode) {
          var node = $scope.albums.currentNode;

          if (node !== null && !node.isLeaf) {
            node.children = node.children || [];
            node.collapsed = false;
            selectedChildren = node.children;
          }
        }

        selectedChildren.push({label: "undefined", isLeaf: false});
      };

      $scope.addAlbum = function () {
        var selectedChildren = $scope.albumTree;

        if ($scope.albums.currentNode) {
          var node = $scope.albums.currentNode;

          if (node !== null && !node.isLeaf) {
            node.children = node.children || [];
            node.collapsed = false;
            selectedChildren = node.children;
          }
        }

        selectedChildren.push({label: "undefined", isLeaf: true});
      };

      $scope.remove = function () {
        if ($scope.albums.currentNode) {
          var node = $scope.albums.currentNode;
          var parent = findParent($scope.albums.currentNode, $scope.albumTree);
          if (parent) {
            parent.children.splice(parent.children.indexOf(node), 1);
            $scope.albums.currentNode = undefined;
          }
        }
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