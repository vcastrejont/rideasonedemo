angular.module('carPoolingApp').controller('homeCtrl', homeCtrl);

homeCtrl.$inject = ['$rootScope','$scope', '$window', 'apiservice','mapFactory'];

function homeCtrl ($rootScope, $scope, $window, apiservice, mapFactory ) {


  $scope.map = mapFactory.getApi();
  $scope.map.defaultLocation();
  
  apiservice.getUserRides($rootScope.user.id)
    .success(function(response) {
        $scope.rides=response;
    })
    .error(function(response) {
        console.error('Error: ' + response);
    });

}
