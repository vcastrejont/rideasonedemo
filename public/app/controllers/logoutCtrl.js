angular.module('carPoolingApp').controller('logoutCtrl', logoutCtrl);

logoutCtrl.$inject = ['$scope','authservice','sessionservice','$state'];

function logoutCtrl ($scope, authservice, sessionservice, $state) {
  sessionservice.clear();
  $state.go('login');

};
