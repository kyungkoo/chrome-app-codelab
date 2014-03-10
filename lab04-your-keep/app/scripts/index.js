'use strict';

angular.module('keepApp', ['monospaced.elastic'])
  .controller('MainCtrl', function($scope) {
    $scope.cards = [
      {
        title: '',
        text: ''
      },
      {
        title: 'title1',
        text: 'text1'
      },
      {
        title: 'title2',
        text: 'text2'
      }
    ];

    $scope.onchange = function(card) {
      // Add empty card on top of cards
      if ($scope.cards[0] === card) {
        $scope.cards.unshift({title: '', text: ''});
      }
    };

  })
  .directive('keepCard', function() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        card: '=ngModel',
        change: '&ngChange'
      },
      templateUrl: 'views/keep-card.html',
      link: function(scope, elem) {
        scope.focused = false;

        // folding card if related target is not family of this card
        // or not, keep expand mode
        var unfocus = function(e) {
          if (!e || !e.relatedTarget ||
              this.parentNode.parentNode !== e.relatedTarget.parentNode.parentNode) {
            scope.editedCard = undefined;
            scope.focused = false;
            // Check that digest already in progress
            if (scope.$root.$$phase !== '$apply' && scope.$root.$$phase !== '$digest') {
              scope.$digest();
            }
          }
        };

        var focus = function() {
          // Deepcopy current card data to compare
          scope.editedCard = angular.extend({}, scope.card);
          scope.focused = true;
          scope.$digest();
        };

        scope.done = function() {
          // Trigger `change` event to $parent scope if card has been changed
          if (scope.editedCard && !angular.equals(scope.editedCard, scope.card)) {
            scope.change({card: scope.card});
          }
          unfocus();
        };

        // Bind focus / blur event fixed controls
        elem.find('textarea').bind('focus', focus);
        elem.find('textarea').bind('blur', unfocus);

        // Refresh bind event to unfixed controls when focused has been changed
        scope.$watch('scope.focused', function() {
          // Bind focus event to expand the card
          // and bind blur event all of input control to fold the card
          elem.find('input').bind('focus', focus);
          elem.find('input').bind('blur', unfocus);
          elem.find('button').bind('blur', unfocus);
        });
      }
    };
  });

