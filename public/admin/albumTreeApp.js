(function () {
  var albumTreeApp = angular.module('albumTreeApp', ['angularTreeview']);

  albumTreeApp.controller('treeController', ["$scope", "$http",
    function ($scope, $http) {
      function findParentScope(node, scope) {
        if (!scope) {
          return null;
        }

        var position = scope.indexOf(node);

        if (position > -1) {
          return scope;
        }

        for (var i = scope.length; i--;) {
          var candidate = findParentScope(node, scope[i].children);
          if (candidate != null) {
            return candidate;
          }
        }

        return null;
      }

      $scope.addFolder = function () {
        var selectedChildren = $scope.albumTree;
        var node = $scope.albums.currentNode;

        if (node && !node.isLeaf) {
          node.children = node.children || [];
          node.collapsed = false;
          node.selected = false;
          selectedChildren = node.children;
        }

        var newNode = {label: $scope.newFolderLabel, isLeaf: false};
        selectedChildren.push(newNode);
        newNode.selected = 'selected';
        newNode.collapsed = false;
        $scope.albums.currentNode = newNode;

      };

      $scope.addAlbum = function () {
        var selectedChildren = $scope.albumTree;
        var node = $scope.albums.currentNode;

        if (node && !node.isLeaf) {
          node.children = node.children || [];
          node.collapsed = false;
          selectedChildren = node.children;
        }

        selectedChildren.push({label: $scope.newAlbumLabel, isLeaf: true});
      };

      $scope.remove = function () {
        if ($scope.albums.currentNode) {
          var node = $scope.albums.currentNode;
          var parentScope = findParentScope($scope.albums.currentNode, $scope.albumTree);

          if (parentScope) {
            parentScope.splice(parentScope.indexOf(node), 1);
            $scope.albums.currentNode = undefined;
          }
        }
      };

      $scope.moveUp = function () {
        if ($scope.albums.currentNode) {
          var node = $scope.albums.currentNode;
          var parentScope = findParentScope($scope.albums.currentNode, $scope.albumTree);

          if (parentScope) {
            var oldIndex = parentScope.indexOf(node);
            var newIndex = oldIndex > 0 ? oldIndex - 1 : oldIndex;
            parentScope.splice(oldIndex, 1);
            parentScope.splice(newIndex, 0, node);
          }
        }
      };

      $scope.moveDown = function () {
        if ($scope.albums.currentNode) {
          var node = $scope.albums.currentNode;
          var parentScope = findParentScope($scope.albums.currentNode, $scope.albumTree);

          if (parentScope) {
            var oldIndex = parentScope.indexOf(node);
            var newIndex = oldIndex < parentScope.length - 1 ? oldIndex + 1 : oldIndex;
            parentScope.splice(oldIndex, 1);
            parentScope.splice(newIndex, 0, node);
          }
        }
      };

      function purify(scope) {
        if (!scope) {
          return;
        }

        for (var i = scope.length; i--;) {
          var item = scope[i];
          delete item.selected;
          delete item.collapsed;

          if (item.children) {
            purify(item.children);
          }
        }
      }

      $scope.saveChanges = function () {
        data = angular.copy($scope.albumTree);
        purify(data);

        $http.post('/admin/manageAlbums/saveChanges', {albumTree: data}).
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