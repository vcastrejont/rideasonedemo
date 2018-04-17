angular.module('carPoolingApp').controller('headerCtrl', function headerCtrl($scope, sessionservice, $firebaseObject, $window) {

  var user = sessionservice.user();
  
  var recentPostsRef = firebase.database().ref('notifications');   
  var ref = firebase.database().ref('notifications/' + user.id );
  ref.on('value', function(snapshot) {
    $scope.notifications = snapshot.val();
    if ( snapshot.val()>0){
        
          $window.document.title = '('+$scope.notifications+') RideAsOne';
    }else{
      $window.document.title = 'RideAsOne';
    }
  
    $scope.$apply()
  });
    
  
    
});
