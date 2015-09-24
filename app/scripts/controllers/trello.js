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
  $scope.num_cards_ok = 0;
  $scope.num_cards_issues = 0;
  $scope.num_cards_blocked = 0;
  $scope.num_cards_total = 0;
  $scope.cards_per_owner = new MiniSet();
  $scope.authorized = false;
  $scope.full_name = 'N.N.';

  $scope.eventText = '';
  var handleSelect = function (item, e) {
    $scope.eventText = item.name + ' selected\n' + $scope.eventText;
  };
  var handleSelectionChange = function (selectedItems, e) {
    $scope.eventText = selectedItems.length + ' items selected\n' + $scope.eventText;
  };
  var handleClick = function (item, e) {
    $scope.eventText = item.name + ' clicked\n' + $scope.eventText;
  };
  var handleDblClick = function (item, e) {
    $scope.eventText = item.name + ' double clicked\n' + $scope.eventText;
  };
  var handleCheckBoxChange = function (item, selected, e) {
    $scope.eventText = item.name + ' checked: ' + item.selected + '\n' + $scope.eventText;
  };

  var checkDisabledItem = function(item) {
    return $scope.showDisabled && (item.name === "John Smith");
  };

  $scope.selectType = 'checkbox';
  $scope.updateSelectionType = function() {
    if ($scope.selectType === 'checkbox') {
      $scope.config.selectItems = false;
      $scope.config.showSelectBox = true;
    } else if ($scope.selectType === 'row') {
      $scope.config.selectItems = true;
      $scope.config.showSelectBox = false;
    } else {
      $scope.config.selectItems = false;
      $scope.config.showSelectBox = false;
    }
  };

  $scope.showDisabled = false;

  $scope.config = {
    selectItems: true,
    multiSelect: false,
    dblClick: false,
    selectionMatchProp: 'name',
    selectedItems: [],
    checkDisabled: checkDisabledItem,
    showSelectBox: false,
    rowHeight: 36,
    onSelect: handleSelect,
    onSelectionChange: handleSelectionChange,
    onCheckBoxChange: handleCheckBoxChange,
    onClick: handleClick,
    onDblClick: handleDblClick
  };

  var get_card_owner = function(card) {
    return "owner";
  }

  var get_data = function() {
    Trello.get('members/me/', function(member) {
      $scope.full_name = member.fullName;
    });

    Trello.get('boards/'+boardId+'/lists', function(lists) {
      Trello.get('boards/'+boardId+'/cards?members=true', function(cards) {
        lists.forEach(function(list) {
          if (!list.name.match(/!/)) {
            cards.forEach(function(card) {
              if (!card.name.match(/!/)) {
                if (card.idList === list.id) {
                  $scope.num_cards_total += 1;

                  var $owner = get_card_owner(card);

                  if ($scope.cards_per_owner.has($owner)) {
                    $scope.cards_per_owner[$owner] += 1;
                  } else {
                    $scope.cards_per_owner.add($owner);
                    $scope.cards_per_owner[$owner] = 1;
                  }

                  var values = {
                    id: card.id,
                    owner: $owner,
                    title: card.name,
                    url: card.shortUrl,
                    description: card.desc
                  };
                  $scope.cards.push(values);

                  console.log($scope.cards_per_owner);
                }
              }
            });
          }
        });
      });
    });
  };

  $scope.onAuthorized = function() {
    $scope.authorized = true;
    get_data();
  };

  $scope.refresh = function() {
    get_data();
  };

  $scope.authorize = function() {
    Trello.authorize({
      type: 'popup',
      name: 'SysEng Reporting',
      success: $scope.onAuthorized
    });
  };

  $scope.deauthorize = function() {
    Trello.deauthorize();
    $scope.authorized = false;
    $scope.cards = [];
  };

  Trello.authorize( {
    interactive: false,
    success: get_data
  });
});
