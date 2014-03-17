'use strict';

angular.module('keepApp', ['monospaced.elastic', 'uuid4'])

// Keep card view controller
.directive('keepCardController', ['$window', function($window) {
  return {
    controller: function ($scope) {
      $scope.editedCard = null;

      // Take focus from prevois card passes to othe card
      $scope.unfocus = function(replaceCard, opts) {
        $scope.editedCard && $scope.editedCard.unfocus(opts);
        $scope.editedCard = replaceCard;
      };

      // For editing start event, take focus from previous card and then
      // set focus to current card
      $scope.$on('keepcard:select', function(e) {
        $scope.unfocus(e.targetScope);
        $scope.editedCard.focus();
      });

      // For editing done event, take focus from the card
      $scope.$on('keepcard:done', function(e, done) {
        $scope.unfocus(null, done);
      });

      // To detect focus on out of card views Take focus from last card
      $window.onclick = function() {
        $scope.$apply(function() {
          $scope.$emit('keepcard:done', false);
        });
      };
    }
  };
}])

// Keep card view
.directive('keepCard', ['$timeout', function($timeout) {
  return {
    restrict: 'E',
    replace: true,
    require: '^keepCardController',
    scope: {
      card: '=ngModel',
      update: '&onUpdate',
      delete: '&onDelete'
    },
    templateUrl: 'views/keep-card.html',
    link: function(scope, elem) {
      scope.focused = false;
      scope.cachedCard = null;
      scope.hover = false;

      // focus and cache card data to editing
      scope.focus = function() {
        scope.focused = true;
        scope.cachedCard = angular.extend({}, scope.card);
        $timeout(function() {
          if (document.activeElement === document.body) {
            elem.find('textarea')[0].focus();
          }
        });
      };

      // unfocus and revert card data from cached
      scope.unfocus = function(done) {
        if (!done) {
          scope.card = angular.extend({}, scope.cachedCard);
        }

        // Cleanup variables
        scope.focused = false;
        scope.cachedCard = null;
        scope.hover = false;
      };

      scope.done = function(e) {
        // If card has changed, notify change event
        if (!angular.equals(scope.cachedCard, scope.card)) {
          scope.update({card: scope.card});
        }

        // Send editing done event to controller and prevent progagation
        scope.$emit('keepcard:done', {done: true});
        e.stopPropagation();
      };

      scope.select = function(e) {
        // Send selecting event to view controller and prevent progagation
        !scope.focused && scope.$emit('keepcard:select');
        e.stopPropagation();
      };

      scope.deleteme = function(e) {
        scope.delete({card: scope.card});
        e.stopPropagation();
      };
    }
  };
}])

// Keep card storage service
.service('CardsStorage', ['$rootScope', '$q', function ($rootScope, $q) {
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (changes.cards && namespace === 'sync') {
      $rootScope.$broadcast('cardsstorage:sync', changes.cards);
    }
  });

  return {
    load: function() {
      var deferred = $q.defer();
      chrome.storage.sync.get('cards', function(cards) {
        deferred[chrome.runtime.lastError ? 'reject' : 'resolve'](cards);
      });

      return deferred.promise;
    },
    save: function(cards) {
      var deferred = $q.defer();
      chrome.storage.sync.set({'cards': cards}, function() {
        deferred[chrome.runtime.lastError ? 'reject' : 'resolve']();
      });

      return deferred.promise;
    },
    clear: function() {
      chrome.storage.sync.clear();
    }
  };
}])

// App main controller
.controller('MainCtrl', ['$scope', 'CardsStorage', 'uuid4',
  function($scope, CardsStorage, uuid4) {
  var newCard = function() {
    return {
      title: '',
      text: '',
      uuid: uuid4.generate()
    };
  };

  $scope.topCard = newCard();
  $scope.cards = [];

  $scope.$on('cardsstorage:sync', function(e, cards) {
    if (cards.newValue) {
      $scope.$apply(function() {
        // What a MASSIVE update of card array
        $scope.cards = angular.copy(cards.newValue);
      });
    }
  });

  $scope.$watch('$viewContentLoaded', function() {
    CardsStorage.load().then(function(data) {
      if (data.cards) {
        $scope.cards = angular.copy(data.cards);
      }
    });
  });

  $scope.add = function(card) {
    $scope.cards.unshift(card);
    CardsStorage.save($scope.cards);
    $scope.topCard = newCard();
  };

  $scope.delete = function(card) {
    $scope.cards.splice($scope.cards.indexOf(card), 1);
    CardsStorage.save($scope.cards);
  };

  $scope.update = function() {
    CardsStorage.save($scope.cards);
  };
}]);
