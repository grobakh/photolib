(function () {
  var albumTreeApp = angular.module('albumTreeApp',
    ['angularTreeview', 'yf.services', 'yf.dragdrop']);

  albumTreeApp.directive('focusMe', function ($timeout) {
    return {
      link: function (scope, element, attrs) {
        attrs.$observe('focusMe', function (value) {
          $timeout(function () {
            element[0].focus();
            element[0].select();
          });
        });
      }
    };
  });

  albumTreeApp.controller('treeController', ["$scope", "$http", "neatUid",
    function ($scope, $http, neatUid) {

      function findNode(nodeId, scope) {
        if (!scope) {
          return null;
        }

        for (var i = scope.length; i--;) {
          var node = scope[i];

          if (node.id === nodeId) {
            return node;
          }

          var candidate = findNode(nodeId, node.children);

          if (candidate) {
            return candidate;
          }
        }

        return null;
      }

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

          if (candidate) {
            return candidate;
          }
        }

        return null;
      }

      function augmentNode(node) {
        node.onDrop = function (dragId) {
          var source = findNode(dragId, $scope.albumTree);
          var oldParentScope = findParent(source, $scope.albumTree);
          var oldPosition = oldParentScope.indexOf(source);
          var newParentScope;
          var newPosition;

          if (node.isLeaf) {
            newParentScope = findParent(node, $scope.albumTree);
            newPosition = newParentScope.indexOf(node) + 1;
          } else {
            node.children = node.children || [];
            newParentScope = node.children;
            newPosition = node.children.length;
          }

          oldParentScope.splice(oldPosition, 1);
          newParentScope.splice(newPosition, 0, source);

          var oldSelection = $scope.albums.currentNode;

          if (oldSelection) {
            oldSelection.selected = false;
          }

          source.selected = 'selected';
          $scope.albums.currentNode = source;

          $scope.$apply();
        };
      }

      $scope.load = function (data) {
        function inject(scope) {
          for (var i = scope.length; i--;) {
            var node = scope[i];

            augmentNode(node);

            if (node.children) {
              inject(node.children);
            }
          }
        }

        inject(data);
        $scope.albumTree = data;
      };

      function addNode(newNode) {
        var selectedChildren = $scope.albumTree;
        var node = $scope.albums.currentNode;
        var position = selectedChildren.length;

        if (node) {
          if (node.isLeaf) {
            var parent = findParent(node, $scope.albumTree, "node");
            if (parent) {
              selectedChildren = parent.children;
              position = parent.children.indexOf(node) + 1;
            } else {
              position = $scope.albumTree.indexOf(node) + 1;
            }
          } else {
            node.children = node.children || [];
            selectedChildren = node.children;
            position = selectedChildren.length;
          }

          node.collapsed = false;
          node.selected = false;
        }

        selectedChildren.splice(position, 0, newNode);
        augmentNode(newNode);
        newNode.selected = 'selected';
        newNode.collapsed = false;
        $scope.albums.currentNode = newNode;
      }

      $scope.addFolder = function () {
        var id = neatUid.new();
        addNode({
          label: $scope.newFolderLabel + " #" + id,
          isLeaf: false,
          id: id
        });
      };

      $scope.addAlbum = function () {
        var id = neatUid.new();
        addNode({
          label: $scope.newAlbumLabel + " #" + id,
          isLeaf: true,
          id: id
        });
      };

      $scope.focusTree = 0;

      $scope.rename = function () {
        if ($scope.albums.currentNode) {
          var node = $scope.albums.currentNode;
          var enterCode = 13;
          var escapeCode = 27;

          if (node) {
            node.edit = true;
            node.oldLabel = node.label;
            node.rename = function ($event) {
              if (!$event || $event.keyCode == enterCode
                || $event.keyCode == escapeCode) {

                if (($event && $event.keyCode == escapeCode) || !node.label) {
                  node.label = node.oldLabel;
                }

                node.edit = false;

                $event.preventDefault();
                $event.stopPropagation();

                $scope.focusTree++;

                return false;
              }
            }
          }
        }
      };

      $scope.onKeyUp = function ($event) {
        if ($event) {
          if ($event.keyCode === 13 || $event.keyCode === 113) {
            $scope.rename();
          }

          if ($event.keyCode === 46 && $event.shiftKey) {
            $scope.remove();
          }

          if ($event.keyCode === 45) {
            if ($event.shiftKey) {
              $scope.addFolder();
            } else {
              $scope.addAlbum();
            }
          }

          if ($event.keyCode === 38) {
            if ($event.ctrlKey) {
              $scope.moveUp();
            } else {
              $scope.selectUp();
            }
          }

          if ($event.keyCode === 40) {
            if ($event.ctrlKey) {
              $scope.moveDown();
            } else {
              $scope.selectDown();
            }
          }

          if ($event.keyCode === 37) {
            if ($event.ctrlKey) {
              $scope.moveLeft();
            } else {
              $scope.selectLeft();
            }
          }

          if ($event.keyCode === 39) {
            if ($event.ctrlKey) {
              $scope.moveRight();
            } else {
              $scope.selectRight();
            }
          }

          $event.preventDefault();
          $event.stopPropagation();
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

      $scope.selectUp = function () {
        if ($scope.albums.currentNode) {
          var node = $scope.albums.currentNode;
          var parentScope = findParent($scope.albums.currentNode, $scope.albumTree);

          if (parentScope) {
            var oldIndex = parentScope.indexOf(node);

            if (oldIndex !== 0) {
              var newIndex = oldIndex - 1;
              var newNode = parentScope[newIndex];

              node.selected = false;
              newNode.selected = 'selected';
              $scope.albums.currentNode = newNode;
            }
          }
        }
      };

      $scope.selectDown = function () {
        if ($scope.albums.currentNode) {
          var node = $scope.albums.currentNode;

          var parentScope = findParent($scope.albums.currentNode, $scope.albumTree);

          if (parentScope) {
            var oldIndex = parentScope.indexOf(node);

            if (oldIndex != parentScope.length - 1) {
              var newIndex = oldIndex + 1;
              var newNode = parentScope[newIndex];

              node.selected = false;
              newNode.selected = 'selected';
              $scope.albums.currentNode = newNode;
            }
          }
        }
      };

      $scope.selectLeft = function () {
        if ($scope.albums.currentNode) {
          var node = $scope.albums.currentNode;
          var parent = findParent($scope.albums.currentNode,
            $scope.albumTree, "node");

          if (parent) {
            var newNode = parent;
            node.selected = false;
            newNode.selected = 'selected';
            $scope.albums.currentNode = newNode;
          }
        }
      };

      $scope.selectRight = function () {
        if ($scope.albums.currentNode) {
          var node = $scope.albums.currentNode;

          if (node.children && node.children.length > 0) {

            var newNode = node.children[0];
            node.collapsed = false;
            node.selected = false;
            newNode.selected = 'selected';
            $scope.albums.currentNode = newNode;
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
          delete item.onDrop;
          delete item.onKey;

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
          error(function (data) {
            alert(data);
          });
      };

    }]);
}());