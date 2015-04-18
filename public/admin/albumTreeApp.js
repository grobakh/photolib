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

      $scope.addFolder = function () {
        var selectedChildren = $scope.albumTree;
        var node = $scope.albums.currentNode;

        if (node && !node.isLeaf) {
          node.children = node.children || [];
          node.collapsed = false;
          node.selected = false;
          selectedChildren = node.children;
        }

        var newNode = {
          label: $scope.newFolderLabel + " #" + counter++,
          isLeaf: false
        };
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

        selectedChildren.push({
          label: $scope.newAlbumLabel + " #" + counter++,
          isLeaf: true
        });
      };

      $scope.rename = function () {
        if ($scope.albums.currentNode) {
          var node = $scope.albums.currentNode;

          if (node) {
            node.edit = true;
            node.rename = function ($event) {
              if (!$event) {
                node.edit = false;
              } else if ($event.keyCode == 13) {
                node.edit = false;
              } else if ($event.keyCode == 27) {
                //$event.target.$rollbackViewValue();
                node.edit = false;
              }
              //if (!node.label) {
              //  if (node.isLeaf) {
              //    node.label = $scope.newAlbumLabel + " #" + counter++;
              //  } else {
              //    node.label = $scope.newFolderLabel + " #" + counter++;
              //  }
              //}
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