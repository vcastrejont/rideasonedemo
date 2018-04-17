angular.module('carPoolingApp').controller('profileCtrl', profileCtrl);

profileCtrl.$inject = ['$scope','apiservice','mapFactory' ];

function profileCtrl ($scope, apiservice, mapFactory) {
  $scope.api = mapFactory.getApi();
  $scope.api.defaultLocation();
}
