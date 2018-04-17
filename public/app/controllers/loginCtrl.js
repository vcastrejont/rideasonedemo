angular.module('carPoolingApp').controller('loginCtrl', loginCtrl);

loginCtrl.$inject = ['$scope','authservice','sessionservice','$state'];

  function loginCtrl ($scope, authservice, sessionservice, $state) {
    

    $scope.$on('event:google-plus-signin-success', function (e, authResult  ) {
    //  console.log(authResult.id_token);
      authservice.login(authResult.id_token).then(function(response){
         console.log(response.data.token);
        sessionservice.set(response.data.token).then(function(user){
          
           $state.go('home');
        });
      
      });
      
      //console.log(authResult.id_token);
    });
    $scope.$on('event:google-plus-signin-failure', function (event, authResult) {
      // User has not authorized the G+ App!
      console.log('Not signed into Google Plus.');
    });
};
