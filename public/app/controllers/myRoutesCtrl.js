var myRoutesCtrl = angular.module('myRoutesCtrl',  ['geolocation', 'gservice']);
myRoutesCtrl.controller('myRoutesCtrl', function($scope, $http, $rootScope, geolocation, gservice) {
  
  $scope.test= "test";  
  geolocation.getLocation().then(function(data){
    // Set the latitude and longitude equal to the HTML5 coordinates
    coords = {lat:data.coords.latitude, long:data.coords.longitude};
    // Display coordinates in location textboxes rounded to three decimal points
    $scope.long = parseFloat(coords.long).toFixed(10);
    $scope.lat = parseFloat(coords.lat).toFixed(10);
    
    // gservice.refresh($scope.latitude, $scope.longitude);
  });
});
