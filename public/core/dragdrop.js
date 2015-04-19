(function (angular) {

  angular.module('yf.dragdrop', ['yf.services'])
    .directive('yfDrag',
    function () {
      return {
        restrict: 'A',
        scope: {
          dragId: "="
        },
        link: function (scope, el) {
          angular.element(el).attr("draggable", "true");

          var id = scope.dragId;

          el.bind("dragstart", function (e) {
            e.dataTransfer.setData('text', id);
          });
        }
      };
    })
    .directive('yfDrop',
    function () {
      return {
        restrict: 'A',
        scope: {
          onDrop: '&'
        },
        link: function (scope, el) {
          el.bind("dragover", function (e) {
            if (e.preventDefault) {
              e.preventDefault();
            }

            e.dataTransfer.dropEffect = 'move';
            return false;
          });

          el.bind("drop", function (e) {
            if (e.preventDefault) {
              e.preventDefault();
            }

            if (e.stopPropagation) {
              e.stopPropagation();
            }

            var dragId = e.dataTransfer.getData("text");
            scope.onDrop({dragId: dragId});
          });
        }
      };
    });
}(angular));