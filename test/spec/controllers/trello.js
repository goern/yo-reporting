'use strict';

describe('Controller: TrelloCtrl', function () {

  // load the controller's module
  beforeEach(module('projectApp'));

  var TrelloCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TrelloCtrl = $controller('TrelloCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

});
