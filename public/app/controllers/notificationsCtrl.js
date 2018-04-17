angular.module('carPoolingApp').controller('notificationsCtrl', notificationsCtrl);

notificationsCtrl.$inject = ['$scope','sessionservice', 'apiservice','$state' ];

function notificationsCtrl ($scope, sessionservice, apiservice, $state ) {
  var user = sessionservice.user();

  $scope.view = {
    
    
    init: function() {
      var self = this;
      apiservice.getNotifications(user.id)
        .success(function(notifications) {
            self.notifications = notifications;
        })
        .error(function(notifications) {
            console.error('Error: ' + notifications.error);
        });
    },
    show: function(notification) {
      var self = this;
      this.current = notification;
      apiservice.getRequest(notification.subject)
        .success(function(response) {
            self.request = response;
        })
        .error(function(response) {
            console.log(response);
        });
      apiservice.readNotification(notification._id)
        .success(function(response) {
            console.log(response)
        })
        .error(function(response) {
            console.error(response);
        });  
    },
    accept: function(message) {
      var ride_id = this.request.ride._id;
      var request_id = this.request._id;
      
      apiservice.acceptRide(ride_id, request_id)
        .success(function(response) {
            console.log(response);
        })
        .error(function(response) {
            console.error('Error: ' + response.error);
        });
    },
    reject: function(message) {
      apiservice.getNotifications(user.id)
        .success(function(notifications) {
            self.notifications = notifications;
            console.log(notifications);
        })
        .error(function(notifications) {
            console.error('Error: ' + notifications.error);
        });
    }
    
    
  }
  $scope.view.init();
  
  
  
  
  
  
  
    
}
