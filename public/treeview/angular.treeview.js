(function (angular) {
  'use strict';

  angular.module('angularTreeview', []).directive('treeModel', ['$compile', function ($compile) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        //tree id
        var treeId = attrs.treeId;

        //tree model
        var treeModel = attrs.treeModel;

        //node id
        var nodeId = attrs.nodeId || 'id';

        //node label
        var nodeLabel = attrs.nodeLabel || 'label';

        //children
        var nodeChildren = attrs.nodeChildren || 'children';

        var isLeaf = attrs.isLeaf || 'isLeaf';

        //tree template
        var template =
          '<ul>' +
          '<li data-ng-repeat="node in ' + treeModel + '">' +
          '<i class="collapsed" data-ng-hide="node.' + isLeaf + ' || !node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
          '<i class="expanded" data-ng-hide="node.' + isLeaf + ' || node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
          '<i class="normal" data-ng-show="node.' + isLeaf + '"></i> ' +
          '<span data-ng-class="node.selected" data-ng-click="' + treeId + '.selectNodeLabel(node)">{{node.' + nodeLabel + '}}</span>' +
          '<div data-ng-hide="node.collapsed" data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren
          + '" data-node-id=' + nodeId + ' data-node-label=' + nodeLabel +
          ' data-node-children=' + nodeChildren + '></div>' +
          '</li>' +
          '</ul>';

        if (treeId && treeModel) {
          if (attrs.angularTreeview) {
            scope[treeId] = scope[treeId] || {};
            scope[treeId].selectNodeHead = scope[treeId].selectNodeHead || function (selectedNode) {
              if (!selectedNode.isLeaf) {
                selectedNode.collapsed = !selectedNode.collapsed;
              }
            };

            scope[treeId].selectNodeLabel = scope[treeId].selectNodeLabel || function (selectedNode) {
              var toSelect = !selectedNode.selected;

              if (scope[treeId].currentNode && scope[treeId].currentNode.selected) {
                scope[treeId].currentNode.selected = undefined;
                scope[treeId].currentNode = undefined;
              }

              if (toSelect) {
                selectedNode.selected = 'selected';
                scope[treeId].currentNode = selectedNode;
              } else {
                delete selectedNode.selected;
              }
            };
          }

          element.html('').append($compile(template)(scope));
        }
      }
    };
  }]);
}(angular));
