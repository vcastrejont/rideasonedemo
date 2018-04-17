angular.module('carPoolingApp').controller('eventsCtrl', eventsCtrl);

eventsCtrl.$inject = ['$scope', '$window', 'apiservice','mapFactory'];

function eventsCtrl ($scope, $window, apiservice, mapFactory) {
  $scope.api = mapFactory.getApi();
  $scope.api.currentLocation();

  apiservice.getEvents()
    .success(function(data) {
        $scope.nextEvents=data;
    })
    .error(function(data) {
        console.error('Error: ' + data);
    });
  apiservice.getPastEvents()
    .success(function(data) {
        $scope.pastEvents=data;
    })
    .error(function(data) {
        console.error('Error: ' + data);
    });
}
