(function () {
  var albumTreeApp = angular.module('albumTreeApp', ['angularTreeview']);

  var counter = 1;

  albumTreeApp.directive('focusMe', function ($timeout) {
    return {
      scope: {trigger: '@focusMe'},
      link: function (scope, element) {
        scope.$watch('trigger', function (value) {
          if (value === "true") {
            $timeout(function () {
              element[0].select();
            });
          }
        });
      }
    };
  });

  albumTreeApp.controller('treeController', ["$scope", "$http",
    function ($scope, $http) {
      function findParent(node, scope, mode, parentNode) {
        if (!scope) {
          return null;
        }

        var position = scope.indexOf(node);

        if (position > -1) {
          return mode === "node" ? parentNode : scope;
        }

        for (var i = scope.length; i--;) {
          var candidate = findParent(node, scope[i].children, mode, scope[i]);

          if (candidate != null) {
            return candidate;
          }
        }

        return null;
      }

      function add(newNode) {
        var selectedChildren = $scope.albumTree;
        var node = $scope.albums.currentNode;
        var position = selectedChildren.length;

        if (node) {
          if (!node.isLeaf) {
            node.children = node.children || [];
            selectedChildren = node.children;
            position = selectedChildren.length;
          } else {
            var parent = findParent(node, $scope.albumTree, "node");
            if (parent) {
              selectedChildren = parent.children;
              position = parent.children.indexOf(node) + 1;
            } else {
              position = $scope.albumTree.indexOf(node) + 1;
            }
          }
          node.collapsed = false;
          node.selected = false;
        }

        selectedChildren.splice(position, 0, newNode);
        newNode.selected = 'selected';
        newNode.collapsed = false;
        $scope.albums.currentNode = newNode;
      }

      $scope.addFolder = function () {
        add({
          label: $scope.newFolderLabel + " #" + counter++,
          isLeaf: false
        });
      };

      $scope.addAlbum = function () {
        add({
          label: $scope.newAlbumLabel + " #" + counter++,
          isLeaf: true
        });
      };

      $scope.rename = function () {
        if ($scope.albums.currentNode) {
          var node = $scope.albums.currentNode;

          if (node) {
            node.edit = true;
            node.oldLabel = node.label;
            node.rename = function ($event) {
              if (!$event || $event.keyCode == 13 || $event.keyCode == 27) {

                if ($event.keyCode == 27 || !node.label) {
                  node.label = node.oldLabel;
                }

                node.edit = false;
              }
            }
          }
        }
      };

      $scope.remove = function () {
        if ($scope.albums.currentNode) {
          var node = $scope.albums.currentNode;
          var parentScope = findParent($scope.albums.currentNode, $scope.albumTree);

          if (parentScope) {
            parentScope.splice(parentScope.indexOf(node), 1);
            $scope.albums.currentNode = undefined;
          }
        }
      };

      function isOnTop(node) {
        return $scope.albumTree.indexOf(node) !== -1;
      }

      $scope.moveUp = function () {
        if ($scope.albums.currentNode) {
          var node = $scope.albums.currentNode;
          var parentScope = findParent($scope.albums.currentNode, $scope.albumTree);

          if (parentScope) {
            var oldIndex = parentScope.indexOf(node);

            if (oldIndex === 0) {
              if (!isOnTop(node)) {
                $scope.moveLeft();
                $scope.moveUp();
                $scope.moveRight();
              }
            } else {
              var newIndex = oldIndex - 1;
              parentScope.splice(oldIndex, 1);
              parentScope.splice(newIndex, 0, node);
            }
          }
        }
      };

      $scope.moveDown = function () {
        if ($scope.albums.currentNode) {
          var node = $scope.albums.currentNode;
          var parentScope = findParent($scope.albums.currentNode, $scope.albumTree);

          if (parentScope) {
            var oldIndex = parentScope.indexOf(node);
            var newIndex = oldIndex < parentScope.length - 1 ? oldIndex + 1
              : oldIndex;
            parentScope.splice(oldIndex, 1);
            parentScope.splice(newIndex, 0, node);
          }
        }
      };

      $scope.moveLeft = function () {
        if ($scope.albums.currentNode) {
          var node = $scope.albums.currentNode;
          var parent = findParent($scope.albums.currentNode,
            $scope.albumTree, "node");

          if (parent) {
            var grandScope = findParent(parent, $scope.albumTree);
            var parentIndex = grandScope.indexOf(parent);
            var parentScope = parent.children;
            var oldIndex = parentScope.indexOf(node);
            parentScope.splice(oldIndex, 1);
            grandScope.splice(parentIndex + 1, 0, node);
          }
        }
      };

      $scope.moveRight = function () {
        if ($scope.albums.currentNode) {
          var node = $scope.albums.currentNode;
          var parentScope = findParent(node, $scope.albumTree);

          if (parentScope) {
            var oldIndex = parentScope.indexOf(node);

            if (oldIndex > 0) {
              var newParentIndex = oldIndex - 1;
              var newParent = parentScope[newParentIndex];

              if (!newParent.isLeaf) {
                newParent.children = newParent.children || [];
                newParent.collapsed = false;
                var newParentScope = newParent.children;

                parentScope.splice(oldIndex, 1);
                newParentScope.splice(newParentScope.length, 0, node);
              }
            }
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
          delete item.edit;
          delete item.oldLabel;

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