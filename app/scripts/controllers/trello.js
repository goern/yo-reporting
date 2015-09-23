'use strict';

/**
* @ngdoc function
* @name projectApp.controller:TrelloCtrl
* @description
* # TrelloCtrl
* Controller of the projectApp
*/
angular.module('projectApp')
.controller('TrelloCtrl', function ($scope) {
  $scope.board_id = 'WZ2gjtnR';
  $scope.users = [];
  $scope.cards = [];
  $scope.comments = [];
  $scope.authorized = Trello.authorized;

  $scope.logout = function () {
    Trello.deauthorize();
  };
  $scope.login = function () {
    Trello.authorize({
      type: "popup",
      scope: {
        read: true,
        write: false
      },
      success: onAuthorize
    });
  };

  function onAuthorize() {
    if (!Trello.authorized()) {
      return;
    }

    Trello.members.get("me", function (member) {
      $scope.fullName = member.fullName;
    });

    $scope.authorized = true;
  }

  $scope.authorize = function() {
    Trello.authorize({
      type: 'popup',
      scope: {
        read: true,
        write: false
      },
      success: function() {
        if (!Trello.authorized()) {
          return;
        }
        if (!$scope.authorized) {
          // get all my data
        }
        $scope.authorized = true;
      }
    });
  };
  $scope.fetchComments = function() {
    Trello.get("boards/" + $scope.board_id + "/actions", {
      limit: 100,
      filter: 'commentCard'
    }, function(data) {
      $scope.$apply(function() {
        return $scope.comments = data;
      });
    });
  };
  $scope.openCard = function(card_id) {
    Trello.get("cards/" + card_id, function(data) {
      window.open(data.url, 'somename');
    });
  };

  Trello.authorize({
    interactive: false,
    success: onAuthorize
  });

  $scope.$watch(function () {
    return Trello.authorized();
  }, function (val) {
    $scope.isLoggedIn = val;
  });
});
