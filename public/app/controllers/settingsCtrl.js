angular.module('carPoolingApp').controller('settingsCtrl', settingsCtrl);

settingsCtrl.$inject = ['$scope', 'apiservice'];

function settingsCtrl($scope, apiservice) {

  $scope.settings = {};

  apiservice.getSettings()
    .success(function(data) {
      $scope.settings = data;
    })
    .error(function(data) {
      console.error('Error: ' + data);
    });


  $scope.saveData = function() {
    apiservice.saveSettings($scope.settings)
      .success(function(res, status) {
        if (res.ok)
          $scope.apiSuccess = true;
      })
      .error(function(data) {
        console.error('Error: ' + data);
      });
  };
}
