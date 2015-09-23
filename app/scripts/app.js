'use strict';

/**
* @ngdoc overview
* @name projectApp
* @description
* # projectApp
*
* Main module of the application.
*/
angular
.module('projectApp', [
  'ngAnimate',
  'ngCookies',
  'ngResource',
  'ngRoute',
  'ngSanitize',
  'ngTouch',
  'patternfly',
  'patternfly.charts',
  'ui.bootstrap'
])
.config(function ($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'views/main.html',
    controller: 'MainCtrl',
    controllerAs: 'main'
  })
  .otherwise({
    redirectTo: '/'
  });
});
