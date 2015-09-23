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
  $scope.boards = [];
  $scope.authorized = false;
  $scope.full_name = 'N.N.';

  var onAuthorize = function( ) {
    $scope.authorized = true;

    Trello.get('members/me/', function(member) {
      $scope.full_name = member.fullName;
    });

    Trello.get( 'members/me/boards', { lists: 'open' }, function( boards ) {
      Trello.get( 'members/me/cards/visible', function( cards ) {
        var result = [];
        boards.filter( function( b ) { return b.closed === false; } )
        .forEach( function( board ) {

          var doingList = board.lists.filter( function( list ) {
            return list.name.toLowerCase( ) === 'doing';
          } );

          if( doingList.length ) {
            var idListDoing = doingList[ 0 ].id;
            var doingCards = cards.filter( function( card ) {
              return card.idList === idListDoing;
            } );
          } else {
            doingCards = [];
          }

          var nextList = board.lists.filter( function( list ) {
            return list.name.toLowerCase( ) === 'next';
          } );

          if( nextList.length ) {
            var idListNext = nextList[ 0 ].id;
            var nextCards = cards.filter( function( card ) {
              return card.idList === idListNext;
            } );
          } else {
            nextCards = [];
          }

          var values = {
            boardName: board.name,
            boardId: board.id,
            boardUrl: board.url,
            nextCards: nextCards,
            doingCards: doingCards
          };
          result.push( values );
        } );
        $scope.$apply( function( ) {
          $scope.boards = result;
          $scope.boards.forEach( function( board ) {
            board.hasCards = ( board.doingCards.length > 0 ) || ( board.nextCards.length > 0 );
          } );
        } );
      } );
    } );
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
    $scope.boards = [];
  };

  Trello.authorize( {
    interactive: false,
    success: onAuthorize
  } );
});
