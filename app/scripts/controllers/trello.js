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
  $scope.projectgroup_map = [];

  $scope.sortType = 'fullname'; // set the default sort type
  $scope.sortReverse  = false;  // set the default sort order

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
    showSelectBox: false,
    rowHeight: 36
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
    return _get_tags_from_card(card).remove(get_card_owner(card)['userid']);
  };

  var get_card_owner = function(card) {
    var owner = '';
    var fullname = '';
    $scope.all_tags = _get_tags_from_card(card);

    card.members.forEach(function(member) {
      var username = member.username;

      if ($scope.all_tags.has(username)) {
        owner = username;
        fullname = member.fullName;
      }
    });

    return { 'userid': owner, 'fullname': fullname };
  };

  var get_projectgroup_mapping = function() {
    Trello.get('boards/vcuJKaxt/lists', function(lists) {
      Trello.get('boards/vcuJKaxt/cards', function(cards) {
        lists.forEach(function(list) {
          var tag_list = new MiniSet();
          var list_name = '';

          if (!list.name.match(/!/)) {
            list_name = list.name;

            cards.forEach(function(card) {
              if (!card.name.match(/!/)) {
                if (card.idList == list.id) {
                  tag_list.add(card.name);
                }
              }
            });
          }

          $scope.projectgroup_map[list_name] = tag_list;
        });
      });
    });
  };

  // this will figure out the project group a set of tags belongs to
  var get_projectgroup = function(tags) {
    console.log($scope.projectgroup_map);

    $scope.projectgroup_map.forEach(function(group) {
      console.log("projectgroup: " + $scope.projectgroup_map[group]);
    });
  }

  $scope.get_data = function() {
    get_projectgroup_mapping();

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

                  // translate trello labels bootstrap labels
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

                  // prepare a data structure to transport all card's data (we care about) to the $scope
                  var values = {
                    id: card.id,
                    owner: $owner['userid'],
                    fullname: $owner['fullname'],
                    title: card.name.replace("["+$owner['userid']+"]",''), // remove the owner-tag
                    url: card.shortUrl,
                    description: card.desc,
                    tags: get_tags_from_card(card).keys(),
                    status: $status,
                    lastActivity: new Date(card.dateLastActivity),
                    project_group: get_projectgroup(get_tags_from_card(card).keys())
                  };

                  // if we see more than 0 comments, add the latest to the scope
                  if (card.badges.comments > 0) {
                    Trello.get('cards/'+card.id+'/actions?id=commentCard', function(comments) {
                      var currentActivity = comments[0]['data']['text'];

                      if (currentActivity !== undefined) {
                        $scope.cards.forEach(function(_card) {
                          if (_card['id'] === card.id) {
                            _card.lastComment = currentActivity;
                            $scope.$apply();
                          }
                        });
                      } // endif
                    });
                  }

                  // push all the card's information to $scope
                  $scope.cards.push(values);

                  // update chart data
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
      scope: {
        read: true,
        write: false },
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
