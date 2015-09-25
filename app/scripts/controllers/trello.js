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
  $scope.all_tags = new MiniSet();

  $scope.navbarCollapsed = true;

  $scope.syseng_cards_chart_config = {
    "donut": {
      "title":"Status",
      "label":{ "show": false },
      "width":25
     },
     "size": { "height": 130 },
     "legend": { "show": true },
     "color": {"pattern":["#3f9c35","#ec7a08", "#cc0000"]},
     "tooltip": {},
     "data": {
       "columns": [["ok", $scope.num_cards_ok], ["issues", $scope.num_cards_issues], ["blocked", $scope.num_cards_blocked]],
       "type": "donut",
       "groups": [["ok", "issues", "blocked"]]
     }
  };

  $scope.syseng_cards_data = {
    'ok': 12,
    'issues': 3,
    'blocked': 1
  };

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

  var _get_tags_from_card = function(card) {
    var re = /\[(.*?)\]/g;
    var tags = new MiniSet();

    var t = card.name.match(re);

    if (t !== null) {
      t.forEach(function(v, i, a) {
        tags.add(v.substring(1,v.length-1));
      });
    }

    return tags;
  };

  var get_tags_from_card = function(card) {
    return _get_tags_from_card(card).remove(get_card_owner(card));
  }

  var get_card_owner = function(card) {
    var owner = '';
    $scope.all_tags = _get_tags_from_card(card);

    card.members.forEach(function(member) {
      var username = member.username;

      if ($scope.all_tags.has(username)) {
        owner = username;
      }
    });

    return owner;
  };

  $scope.get_data = function() {
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
                  var $owner = get_card_owner(card);
                  var $status = ''; // this is for mapping a trello label name to bootstrap label classes

                  $scope.num_cards_total += 1;

                  card.labels.forEach(function(v, i, a) {
                    switch(v.name.toLowerCase()) {
                      case 'ok':
                        $scope.num_cards_ok += 1;
                        $status = 'success';
                        break;
                      case 'issues':
                        $scope.num_cards_issues += 1;
                        $status = 'warning';
                        break;
                      case 'blocked':
                        $scope.num_cards_blocked += 1;
                        $status = 'danger';
                        break;
                      default:
                        break;
                    }
                  });

                  var values = {
                    id: card.id,
                    owner: $owner,
                    title: card.name.replace("["+$owner+"]",''), // remove the owner-tag
                    url: card.shortUrl,
                    description: card.desc,
                    tags: get_tags_from_card(card).keys(),
                    status: $status
                  };
                  $scope.cards.push(values);

                  $scope.syseng_cards_chart_config.data.columns = [["ok", $scope.num_cards_ok], ["issues", $scope.num_cards_issues], ["blocked", $scope.num_cards_blocked]];

                  // http://jimhoskins.com/2012/12/17/angularjs-and-apply.html
                  $scope.$apply();
                }
              }
            });
          }
        });
      });
    });
  };

  var onAuthorized = function() {
    $scope.authorized = true;
    $scope.get_data();
  };

  $scope.refresh = function() {
    $scope.get_data();
  };

  $scope.authorize = function() {
    Trello.authorize({
      type: 'popup',
      name: 'SysEng Reporting',
      success: onAuthorized
    });
  };

  $scope.deauthorize = function() {
    Trello.deauthorize();
    $scope.authorized = false;
    $scope.cards = [];
    $scope.num_cards_ok = 0;
    $scope.num_cards_issues = 0;
    $scope.num_cards_blocked = 0;
    $scope.num_cards_total = 0;
    $scope.syseng_cards_chart_config.data.columns = [["ok", $scope.num_cards_ok], ["issues", $scope.num_cards_issues], ["blocked", $scope.num_cards_blocked]];
  };

});
