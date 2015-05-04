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

        var expandedExpr = "node.isLeaf || node.collapsed ? 'collapsed' : 'expanded'";

        var switchTemplate = '<span ng-switch on="!!node.edit" ' +
          'yf-drop on-drop="node.onDrop(dragId)" >' +
          '<input ng-switch-when="true" ng-model="node.label" ' +
          'ng-blur="node.rename()" ' +
          'ng-keyup="node.rename($event)" ' +
          'focus-me="node.edit" ' +
          'required ' +
          '/>' +
          '<span class="label" ng-class="node.selected" ' +
          'ng-click="' + treeId + '.selectNodeLabel(node)" ' +
          'yf-drag drag-id="node.id" ' +
          'ng-switch-default>{{node.' + nodeLabel + '}}</span>' +
          '</span>';

        //tree template
        var template =
          '<ul>' +
          '<li ng-repeat="node in ' + treeModel + '" ng-class="' + expandedExpr + '">' +
          '<i class="collapsed" ng-hide="node.' + isLeaf + ' || !node.collapsed" ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
          '<i class="expanded" ng-hide="node.' + isLeaf + ' || node.collapsed" ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
          '<i class="normal" ng-show="node.' + isLeaf + '"></i> ' +
          switchTemplate +
          '<div ng-hide="node.collapsed" tree-id="' + treeId + '" tree-model="node.' + nodeChildren
          + '" node-id=' + nodeId + ' node-label=' + nodeLabel +
          ' node-children=' + nodeChildren + '></div>' +
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
