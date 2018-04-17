angular.module('carPoolingApp').controller('eventsShowCtrl', eventsShowCtrl);

eventsShowCtrl.$inject = ['$scope', 'apiservice', '$state', '$window', 'mapFactory', 'Notification'];

function eventsShowCtrl($scope, apiservice, $state, $window, mapFactory, Notification) {
  $scope.id = $state.params.id;
  $scope.map = mapFactory.getApi();
  $scope.map.placesAutocomplete('autocomplete1');
  $scope.newcar = {};
  $scope.idSelectedRide = null;


  $scope.messageDriver = function(car) {
    $scope.messageCar = car;
    $('#sendMessageModal').modal("show");
  };

  $scope.view = {
    addcar: false,
    timePickerOptions: {
      step: 30,
      timeFormat: 'g:ia',
      'minTime': '8:00am',
      'maxTime': '7:30am'
    },

    showRide: function(ride) {
      //console.log(ride);
      var origin =  new google.maps.LatLng(ride.place.location.lat, ride.place.location.lon);
      var destination =  new google.maps.LatLng(this.event.place.location.lat, this.event.place.location.lon);
      
      $scope.view.showride = null;
      $scope.idSelectedRide = null;
      $scope.map.showRoute(origin, destination);
      $scope.view.showride = ride;
      $scope.idSelectedRide = ride._id; 
    },
    back: function(){
        window.history.back();
    },
    closeRide: function() {
      $scope.view.showride = null;
      $scope.idSelectedRide = null;
    },
    init: function() {
      var self = this;
      $scope.map.clearMarks();
      $scope.map.clearRoutes();
      apiservice.getEvent($scope.id).then(function(response) {
        self.event = response.data;
        
        $scope.newcar = {
          departure: moment(self.event.starts_at)
        };
        
        $scope.map.addMarker({
          lat: self.event.place.location.lat,
          lng: self.event.place.location.lon,
          center: true,
          zoom: true 
        });
        
      //  $scope.map.setBounds(self.event.going_rides);
          
        _.each(self.event.going_rides, function(ride) {
          var marker = $scope.map.addMarker({
            lat: ride.place.location.lat,
            lng: ride.place.location.lon,
            icon: 'car'
          });
          
          marker.addListener('click', function() {
            $scope.view.showride = null;
            $scope.idSelectedRide = null;
            $scope.view.showRide(ride);
          });
        });
        
      

      }, function(response) {
        console.error('Error: ' + response.data);
      });
    },

    addCar: function() {
      var self = this;
      var placeData = mapFactory.getLocation();
      $scope.map.infoWindowClose();
      //console.log(placeData);

      var carData = {
        "place": {
          "name": placeData.place_name,
          "google_places_id": placeData.place_id,
          "address": placeData.address,
          "location": {
            "lat": placeData.location.lat,
            "lon": placeData.location.lon
          }
        },
        departure:  $scope.newcar.departure,
        seats: $scope.newcar.seats,
        comment: $scope.newcar.comment,
        going: true
      };
      $scope.newcar = {};
      apiservice.addCarToEvent($scope.view.event._id, carData).then(function(response) {
        $scope.view.addcar = false;
        Notification('Your car has been added');
        $scope.view.init();
      }, function(response) {
        console.error('Error: ' + response);
        Notification.error('There was an error...');
      });
    },
    
    deleteCar: function(carid) {
      if (confirm("Are you sure?")) {
        var carData = {
          id: $scope.view.event._id,
          carid: carid
        };
        var self = this;
        apiservice.deleteCarFromEvent(carData).then(function(response) {
          self.alerts.push({
            msg: response.data.message
          });
          setTimeout(function() {
            $scope.$apply(function() {
              self.closeAlert();
            });
            $scope.view.init();
          }, 1000);
        }, function(response) {
          console.log('Error: ' + response);
        });
      }
    },
    joinCar: function(ride) {
      swal({  
         title: "Request ride",   
         text: "Do you want to join " + ride.driver.name + " car ?",   
         showCancelButton: true,   
         confirmButtonColor: "#2EBFD9",   
         confirmButtonText: "Yes",   
         closeOnConfirm: false
        }, 
         function(){ 
          var userData = {
           place: {
             address: "Villa de Sta. Fe, Residencial de Anza, Hermosillo, Son., Mexico",
             name: "Villa de santa fe",
             google_places_id: "ChIJZ2L_7BKEzoYRpRk4K28IsT8",
             location: {
               lat: 29.0829989,
               lon: -110.98454200000003
             }
           }
          };
           
          var self = this;
          apiservice.joinCar(ride._id, userData).then(function(response) {
           console.log("request sent");
           swal("Request sent",  ride.driver.name + " will recive your request" );
          }, function(response) {
           console.log('Error: ' + response);
          });
      });
        
    

    },
    leaveCar: function(carid) {
      if (confirm("Are you sure ?")) {
        var carData = {
          event_id: $scope.view.event._id,
          car_id: carid
        };
        var self = this;
        apiservice.leaveCar(carData).then(function(response) {
          self.alerts.push({
            msg: response.data.message
          });
          setTimeout(function() {
            $scope.$apply(function() {
              self.closeAlert();
            });
            $scope.view.init();
          }, 1000);
        }, function(response) {
          console.log('Error: ' + response);
        });
      }
    },
    deleteEvent: function(event) {
      console.log(event);
      swal({  
       title: "Request ride",   
       text: "Do you want to delete " + event.name + " ?",   
       type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: true
      }, 
       function(){ 
         apiservice.deleteEvent(event._id).then(function(response) {
           $state.go('events');
         }, function(response) {
           console.error('Error: ' + response);
         });
      });
    
    },
    addExtra: function(carid) {
      var carData = {
        event_id: this.event._id,
        car_id: carid,
        extra_going: this.goingRide.extraPass,
        extra_back: this.backRide.extraPass,
      };
      var self = this;
      apiservice.addExtraCar(carData).then(function(response) {
        self.alerts.push({
          msg: response.data.message
        });
        setTimeout(function() {
          $scope.$apply(function() {
            self.closeAlert();
          });
          $scope.view.init();
        }, 1000);
      }, function(response) {
        console.log('Error: ' + response);
      });
    },
    closeAlert: function(index) {
      this.alerts.splice(index, 1);
    }

  };



  $scope.view.init();

};
