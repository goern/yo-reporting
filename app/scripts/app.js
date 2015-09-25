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
  'ngCookies',
  'ngSanitize',
  'ngTouch',
  'patternfly',
  'patternfly.charts',
  'ui.bootstrap'
])
.config(function($httpProvider) {
    //Enable cross domain calls
    $httpProvider.defaults.useXDomain = true;
  });
