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
  'patternfly.charts'
])
.config(function ($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'views/main.html',
    controller: 'MainCtrl',
    controllerAs: 'main'
  })
  .when('/about', {
    templateUrl: 'views/about.html',
    controller: 'AboutCtrl',
    controllerAs: 'about'
  })
  .when('/login', {
    templateUrl: 'views/about.html',
    controller: 'LoginCtrl',
    controllerAs: 'login'
  })
  .when('/contact', {
    templateUrl: 'views/contact.html',
    controller: 'ContactCtrl',
    controllerAs: 'contact'
  })
  .otherwise({
    redirectTo: '/'
  });
});

var opt = {
  type: "popup",
  name: "SysEng Reporting",
  scope: { read: true },
  success: onSuccess,
  error: onError
};

Trello.authorize(opt);
