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
  $scope.board_id = '519394de1fb3e3b9110042c7';
  $scope.comments = [];
  $scope.authorized = Trello.authorized;

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
          $scope.fetchComments();
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
});
