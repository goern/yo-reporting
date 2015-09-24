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
  $scope.boardFilter = '';
  $scope.cards = [];
  $scope.authorized = false;
  $scope.full_name = 'N.N.';

  var onAuthorize = function() {
    $scope.authorized = true;

    Trello.get('members/me/', function(member) {
      $scope.full_name = member.fullName;
    });

    Trello.get('boards/'+boardId+'/lists', function(lists) {
      var result = [];

      Trello.get('boards/'+boardId+'/cards?members=true', function(cards) {
        lists.forEach(function(list) {
          if (!list.name.match(/!/)) {
            cards.forEach(function(card) {
                var values = {
                  id: card.id,
                  title: card.name,
                  url: card.shortUrl
                };
                $scope.cards.push(values);
                console.log(values);
            });
          }
        });
      });
    });

    console.log($scope.cards);
  };

  $scope.refresh = function( ) {
    onAuthorize( );
  };

  $scope.authorize = function( ) {
    Trello.authorize( {
      type: 'popup',
      name: 'SysEng Reporting',
      success: onAuthorize
    } );
  };

  $scope.deauthorize = function( ) {
    Trello.deauthorize( );
    $scope.authorized = false;
    $scope.cards = [];
  };

  Trello.authorize( {
    interactive: false,
    success: onAuthorize
  } );
});
