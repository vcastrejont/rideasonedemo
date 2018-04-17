var app = angular.module('carPoolingApp', [
  'geolocation',
  'ui.bootstrap',
  'ui.router',
  'apiservice',
  'directive.g+signin',
  'ngStorage',
  'ui.timepicker',
  'ui-notification',
  'angularMoment',
  'firebase'
]); 

app.run(['$rootScope', '$location', '$window',
  function($rootScope, $location, $window) {

    $rootScope.$on('$stateChangeSuccess',
      function(event) {
        if (!$window.ga) {
          return;
        }
        //console.log($location.path());
        $window.ga('send', 'pageview', {
          page: $location.path()
        });
      });
  }
]);

app.run(function($rootScope, $state, authservice, sessionservice, $localStorage, mapFactory) {
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    if (sessionservice.check()) {
      $rootScope.user = sessionservice.user();
    }else{
      if (toState.name!=='login'){
        event.preventDefault();
        $state.go('login');
      }
    }
  });
});


app.config(function($stateProvider, $urlRouterProvider, $httpProvider, NotificationProvider) {
  $urlRouterProvider.otherwise('/');
  var home = {
    name: 'home',
    url: '^/',
    templateUrl: "app/templates/index.html",
    templateUrl: "app/templates/home.html",
    controller: homeCtrl
  },
  getaride = {
    name: 'getaride',
    url: '^/getaride',
    templateUrl: "app/templates/getaride.html"
  },
  events = {
    name: 'events',
    url: '^/events',
    templateUrl: "app/templates/events.html",
    controller: eventsCtrl
  },
  eventShow = {
    name: 'eventshow',
    url: '^/event/show/:id',
    templateUrl: "app/templates/events.show.html",
    controller: eventsShowCtrl
  },
  eventsNew = {
    name: 'eventsnew',
    url: '^/events/new',
    templateUrl: "app/templates/events.new.html",
    controller: eventsNewCtrl
  },
  notifications = {
    name: 'notifications',
    url: '^/notifications/:id',
    templateUrl: "app/templates/notifications.html",
    controller: notificationsCtrl
  },
  login = {
    name: 'login',
    url: '^/login',
    templateUrl: "app/templates/login.html",
    controller: loginCtrl
  },
  logout = {
    name: 'logout',
    url: '^/logout',
    templateUrl: "app/templates/login.html",
    controller: logoutCtrl
  },
  profile = {
    name: 'profile',
    url: '^/profile',
    templateUrl: "app/templates/profile.html",
    controller: profileCtrl
  },
  mobile = {
    name: 'mobile',
    url: '^/mobile',
    templateUrl: "app/templates/mobile.html"
  };

  $stateProvider
  .state(home)
  .state(getaride)
  .state(events)
  .state(eventShow)
  .state(eventsNew)
  .state(login)
  .state(logout)
  .state(notifications)
  .state(profile)
  .state(mobile);
  
  $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function ($q, $location, $localStorage) {
     return {
         'request': function (config) {
             config.headers = config.headers || {};
             if ($localStorage.token) {
                 config.headers.Authorization = 'JWT ' + $localStorage.token;
             }
             return config;
         },
         'responseError': function (response) {
             if (response.status === 401 || response.status === 403) {
                 $location.path('/login');
             }
             return $q.reject(response);
         }
     };
  }]);
  
  NotificationProvider.setOptions({
   delay: 2000,
   startTop: 50,
   startRight: 0,
   verticalSpacing: 20,
   horizontalSpacing: 20,
   positionX: 'center',
   positionY: 'top'
 });
  
  
});

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

angular.module('carPoolingApp').controller('eventsNewCtrl', eventsNewCtrl);

eventsNewCtrl.$inject = ['$scope', 'apiservice',  '$state','mapFactory' ];

function eventsNewCtrl ($scope, apiservice, $state, mapFactory ) {

  $scope.map = mapFactory.getApi();
  $scope.map.currentLocation();
  $scope.map.placesAutocomplete('autocomplete1');
  
  $scope.setDate = function() {
    $scope.event.endDate =  $scope.event.endDate || $scope.event.startDate;
  };
  
  $scope.setTime = function() {
    $scope.event.endTime=  moment($scope.event.startTime).add(1, 'hours');
  };

  $scope.timePickerOptions = {
    step: 30,
    timeFormat: 'g:ia',
    'minTime': '8:00am',
    'maxTime': '7:30am'
  };

  $scope.saveData = function() {
    var starts_date = moment($scope.event.startDate).format('YYYY-MM-DD');
    var starts_time = moment($scope.event.startTime).format('HH:mm');
    var starts_at = moment(starts_date+" "+starts_time, "YYYY-MM-DD HH:mm").utc().format();
    var ends_date = moment($scope.event.endDate).format('YYYY-MM-DD');
    var ends_time = moment($scope.event.endTime).format('HH:mm');
    var ends_at = moment(ends_date+" "+ends_time, "YYYY-MM-DD HH:mm").utc().format();
    

    var eventData = $.extend($scope.event, mapFactory.getLocation());
    $scope.map.infoWindowClose();
    $scope.map.clearMarks();
     
    var newEvent={
      "name": eventData.name,
      "description": eventData.description,
      "place": {
          "name": eventData.place_name,
          "google_places_id": eventData.place_id,
          "address": eventData.address,
          "location": {
            "lat": eventData.location.lat,
            "lon": eventData.location.lon
          }
      },
      "starts_at": starts_at,
      "ends_at": ends_at
    };
    
    apiservice.createEvent(newEvent)
      .success(function(res, status) {
          $scope.map.currentLocation();
          $scope.apiSuccess = true;
          $state.go('events');
      })
      .error(function(data) {
        console.error('Error: ' + data);
      });
  };



}

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

angular.module('carPoolingApp').controller('logoutCtrl', logoutCtrl);

logoutCtrl.$inject = ['$scope','authservice','sessionservice','$state'];

function logoutCtrl ($scope, authservice, sessionservice, $state) {
  sessionservice.clear();
  $state.go('login');

};

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

angular.module('carPoolingApp').controller('profileCtrl', profileCtrl);

profileCtrl.$inject = ['$scope','apiservice','mapFactory' ];

function profileCtrl ($scope, apiservice, mapFactory) {
  $scope.api = mapFactory.getApi();
  $scope.api.defaultLocation();
}

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

angular
.module('carPoolingApp')
.directive('mapcanvas', mapcanvas);

mapcanvas.$inject = ['mapFactory'];

function mapcanvas(mapFactory) {
  return {
    restrict: 'E',
    replace: true,
    template: '<div></div>',
    link: function(scope, element, attrs) {
        var myOptions = {
          zoom: 13,
          center: new google.maps.LatLng(46.87916, -3.32910),
          disableDefaultUI: true,
          draggable: true,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }, 
          directionsService = new google.maps.DirectionsService(), 
          directionsDisplay = new google.maps.DirectionsRenderer(),
          map = new google.maps.Map(document.getElementById(attrs.id), myOptions),
          config;
        
        directionsDisplay.setMap(map);
        config = mapFactory.build(directionsService, directionsDisplay, map);
        mapFactory.setApi(config);
      } // link
  }; // return
}

angular.module('carPoolingApp').factory('mapFactory', function($rootScope) {
  var api = {},
  currentEventLocation,
  marker,
  infomarker;
  var markersArray = [];
  var infoWindows = [];
  var mapFactory = {
    api: {},
    autocomplete: null,
    setApi: function(_api) {
      api = _api;
      this.success();
    },

    getApi: function() {
      return api;
    },

    setApiMeth: function(meth) {
      return false;
    },

    success: function() {
      $rootScope.$broadcast('mapFactory:success');
    },
    
  

    setLocationData: function(place) {
      currentLocation = {
        place_name: place.name,
        address: place.formatted_address,
        google_places_id: place.google_places_id,
        place_id: place.place_id,
        location: {
          lat: place.geometry.location.lat(),
          lon: place.geometry.location.lng()
        }
      };
    },

    getLocation: function() {
      return currentLocation;
    },

    build: function(directionsService, directionsDisplay, map) {
      return {
        
        defaultLocation: function() {
           defaultPos = {
             lat: 32.4650114,
             lng:  -53.1544719
           };
           map.setCenter(defaultPos);
           map.setZoom(4);
         },

        currentLocation: function(zoom) {
          zoom = zoom || 13;
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
              defaultPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              map.setCenter(defaultPos);
              map.setZoom(zoom);
              console.log("Auto geolocation success");
            }, function() {
              console.log("Auto geolocation failed");
            });
          }
        },
        
        infoWindowClose: function() {
          for (var i=0;i<infoWindows.length;i++) {
            infoWindows[i].close();
          };
          infomarker.setMap(null);
          infoWindows.length = 0;
          
        },
        clearRoutes:function(){
          
          directionsDisplay.setDirections({routes: []});
        },
        
        clearMarks: function(){
          for (var i = 0; i < markersArray.length; i++ ) {
            markersArray[i].setMap(null);
          }
          markersArray.length = 0;
        },
        
        addMarker: function(place) {
          var latLng = new google.maps.LatLng(place.lat, place.lng);
        //   var icon = {
        //     path:'M0-48c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z',
        //     fillColor: '#03A9F4',
        //     fillOpacity: 1,
        //     scale: .8,
        //     strokeColor: '#fff',
        //     strokeWeight: 1
        //  };
        
          if(place.icon == 'car'){
            var icon = 'assets/icons/car.png';
          }
          else {
              var icon = 'assets/icons/des.png';
          }
          var marker = new google.maps.Marker({
            position: latLng,
            map: map,
            animation: google.maps.Animation.DROP,
            icon: icon
          });
          if (place.center === true) {
            map.setCenter(latLng);
          }
          if (place.zoom === true) {
            map.setZoom(13);
          }
           markersArray.push(marker);
          return marker;
        },
        
        setBounds:function(rides){
          var bounds = new google.maps.LatLngBounds();
          _.each(rides, function(ride) {
            var placeLocation = new google.maps.LatLng(ride.place.location.lat, ride.place.location.lon);
            bounds.extend(placeLocation);
          });
          map.fitBounds(bounds);
          var listener = google.maps.event.addListener(map, "idle", function() { 
            if (map.getZoom() > 13) map.setZoom(13); 
            google.maps.event.removeListener(listener); 
          });
        },

        showRoute: function(origin, destination) {
          directionsService.route({
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING
          }, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
              directionsDisplay.setOptions({
                preserveViewport: true,
                draggable: false,
                hideRouteList: true,
                suppressMarkers: true,
                polylineOptions:{ strokeColor:"#757575", strokeWeight:3 }
              });
              directionsDisplay.setDirections(response);
               map.panTo(origin, destination); 
            } else {
              console.error('Directions request failed due to ' + status);
            }
          });
        },

        placesAutocomplete: function(inputField) {
        
          //var input = document.getElementsByClassName(inputField);
          var address = '';
        
          mapFactory.autocomplete = new google.maps.places.Autocomplete(document.getElementById(inputField));

          mapFactory.autocomplete.bindTo('bounds', map);
    
          // mapFactory.autocomplete.addListener('place_changed', mapFactory.setEventLocationData);

          var infowindow = new google.maps.InfoWindow();
          marker = new google.maps.Marker({
            map: map,
            anchorPoint: new google.maps.Point(0, -29)
          });

          mapFactory.autocomplete.addListener('place_changed', function() {
            infowindow.close();
            marker.setVisible(false);
            
            var place = mapFactory.autocomplete.getPlace();
            mapFactory.setLocationData(place);
            
            // console.log("place:");
            // console.log(place);
            if (!place.geometry) {
              window.alert("Autocomplete's returned place contains no geometry");
              return;
            }


            if (place.geometry.viewport) {
              map.fitBounds(place.geometry.viewport);
              
            } else {
              map.setCenter(place.geometry.location);
              //map.setZoom(15);
            }
            map.setZoom(15);
            marker.setIcon( /** @type {google.maps.Icon} */ ({
              url: place.icon,
              size: new google.maps.Size(71, 71),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(17, 34),
              scaledSize: new google.maps.Size(35, 35)
            }));
            marker.setPosition(place.geometry.location);
            marker.setVisible(true);
            

            if (place.address_components) {
              address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
              ].join(' ');
            }
            infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
            infowindow.open(map, marker);
            infoWindows.push(infowindow);
            infomarker = marker;
            
          });
          return address;
        }
      };
    },
  };

  return mapFactory;
});

angular.module('carPoolingApp')

.filter("onlyGoingPassengers", function() {
  return function(passengers) {
    var filtered = [];

    angular.forEach(passengers, function(p) {
      if(p.going) {
        filtered.push(p);
      }
    });

    return filtered;
  }
})
.filter("onlyBackPassengers", function() {
  return function(passengers) {
    var filtered = [];

    angular.forEach(passengers, function(p) {
      if(p.back) {
        filtered.push(p);
      }
    });

    return filtered;
  }
});

angular.module('apiservice', [])
.factory('apiservice', ['$http', apiservice]);

function apiservice($http) {
	var service = {};

	service.getUserRides = function(user_id) {
		return $http.get('/api/users/'+user_id+'/rides');
	};
	
	
	service.getEvent = function(eventId) {
		return $http.get('/api/events/' + eventId);
	};

	service.getEvents = function() {
		return $http.get('/api/events');
	};

	service.deleteEvent = function(eventId) {
		return $http.delete('/api/events/' + eventId);
	};

	service.getPastEvents = function() {
		return $http.get('/api/events/past');
	};

	service.createEvent = function(eventData) {
		return $http.post("/api/events", eventData);
	};

	service.signupToEvent = function(eventId) {
		return $http.put('/api/events/signup/' + eventId);
	};

	service.addCarToEvent = function(eventId, carData) {
		return $http.post('/api/events/'+eventId+'/ride', carData);
	};

	service.deleteCarFromEvent = function(carData) {
		// This should be a delete
		// DELETE /api/events/:eventId/car/:carId
		return $http.post('/api/events/deletecar', carData);
	};

	service.joinCar = function(ride_id, userData) {
		return $http.put('/api/rides/'+ride_id+'/join', userData);
	};
	
	service.getNotifications = function(userid) {
		return $http.get('/api/user/notifications');
	};
	
	service.readNotification = function(notification_id) {
		//"/user/notifications/:notification_id/read"
		return $http.put('/api/user/notifications/'+notification_id+'/read');
	};
	
	service.getRequest = function(request_id) {
		return $http.get('/api/ride-requests/'+request_id);
	};


	service.acceptRide = function(ride_id, request_id) {
		// /rides/:ride_id/ride-requests/:request_id/accept
		return $http.put('/api/rides/'+ride_id+'/ride-requests/'+request_id+'/accept');
	};
	
	service.rejectRide = function(ride_id) {
		return $http.put('/api/users/'+ride_id+'/reject');
	};
	
	
	service.leaveCar = function(carData) {
		return $http.post('/api/events/leavecar', carData);
	};

	service.addExtraCar = function(carData) {
		return $http.post('/api/events/addExtra', carData);
	};

	service.getSettings = function() {
		return $http.get('/api/settings');
	};

	service.saveSettings = function(settings) {
		return $http.post('/api/settings', settings);
	};

	service.sendMessage = function(options) {
		return $http.post('/api/events/' + options.eventId + '/car/' + options.carId + '/message', { message: options.message });
	};

	return service;
}

angular
.module('carPoolingApp')
.service('authservice', authservice);

authservice.$inject = ['$http'];

function authservice($http) {
  return {
    login: function(id_token) {
      return $http.post('/auth/google',  { id_token: id_token } );  
    },
    
  };
}

angular.module('gservice', [])
    .factory('gservice', function($rootScope, $http){

        // Initialize Variables
        // -------------------------------------------------------------
        // Service our factory will return
        var googleMapService = {};
        googleMapService.clickLat  = 0;
        googleMapService.clickLong = 0;

        // Array of locations obtained from API calls
        var locations = [];

        // Variables we'll use to help us pan to the right spot
        var lastMarker, currentSelectedMarker;

        // User Selected Location (initialize to center of America)
        var selectedLat = 29.08;
        var selectedLong = -110.985;

      
        // Functions
        // --------------------------------------------------------------
        // Refresh the Map with new data. Takes three parameters (lat, long, and filtering results)
        googleMapService.refresh = function(latitude, longitude, filteredResults){

            // Clears the holding array of locations
            locations = [];

            // Set the selected lat and long equal to the ones provided on the refresh() call
            selectedLat = latitude;
            selectedLong = longitude;

            // If filtered results are provided in the refresh() call...
            if (filteredResults){

                // Then convert the filtered results into map points.
                locations = convertToMapPoints(filteredResults);

                // Then, initialize the map -- noting that a filter was used (to mark icons yellow)
                initialize(latitude, longitude, true);
            }

            // If no filter is provided in the refresh() call...
            else {

                // Perform an AJAX call to get all of the records in the db.
                $http.get('/locations').success(function(response){

                    // Then convert the results into map points
                    locations = convertToMapPoints(response);

                    // Then initialize the map -- noting that no filter was used.
                    initialize(latitude, longitude, false);
                }).error(function(){});
            }
        };

        // Private Inner Functions
        // --------------------------------------------------------------

        // Convert a JSON of users into map points
        var convertToMapPoints = function(response){

            // Clear the locations holder
            var locations = [];

            // Loop through all of the JSON entries provided in the response
            for(var i= 0; i < response.length; i++) {
                var user = response[i];

                // Create popup windows for each record
                var  contentString = '<p><b>Name</b>: ' + user.name + '<br><b>Age</b>: ' + user.age + '<br>' +
                    '<b>Gender</b>: ' + user.gender + '<br><b>Favorite Language</b>: ' + user.favlang + '</p>';

                // Converts each of the JSON records into Google Maps Location format (Note Lat, Lng format).
                locations.push(new Location(
                    new google.maps.LatLng(user.location[1], user.location[0]),
                    new google.maps.InfoWindow({
                        content: contentString,
                        maxWidth: 320
                    }),
                    user.username,
                    user.gender,
                    user.age,
                    user.favlang
                ))
            }
            // location is now an array populated with records in Google Maps format
            return locations;
        };

        // Constructor for generic location
        var Location = function(latlon, message, username, gender, age, favlang){
            this.latlon = latlon;
            this.message = message;
            this.username = username;
            this.gender = gender;
            this.age = age;
            this.favlang = favlang
        };

        // Initializes the map
        var initialize = function(latitude, longitude, filter) {

            // Uses the selected lat, long as starting point
            var myLatLng = {lat: selectedLat, lng: selectedLong};

            // If map has not been created...
            if (!map){

                // Create a new map and place in the index.html page
                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 13,
                    center: myLatLng
                });
            }

            // If a filter was used set the icons yellow, otherwise blue
            if(filter){
                icon = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
            }
            else{
                icon = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
            }

            // Loop through each location in the array and place a marker
            locations.forEach(function(n, i){
               var marker = new google.maps.Marker({
                   position: n.latlon,
                   map: map,
                   title: "Big Map",
                   icon: icon,
               });

                // For each marker created, add a listener that checks for clicks
                google.maps.event.addListener(marker, 'click', function(e){

                    // When clicked, open the selected marker's message
                    currentSelectedMarker = n;
                    n.message.open(map, marker);
                });
            });

            // Set initial location as a bouncing red marker
            var initialLocation = new google.maps.LatLng(latitude, longitude);
            var marker = new google.maps.Marker({
                position: initialLocation,
                animation: google.maps.Animation.BOUNCE,
                map: map,
                icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            });
            lastMarker = marker;

            // Function for moving to a selected location
            map.panTo(new google.maps.LatLng(latitude, longitude));

            // Clicking on the Map moves the bouncing red marker
            google.maps.event.addListener(map, 'click', function(e){
                var marker = new google.maps.Marker({
                    position: e.latLng,
                    animation: google.maps.Animation.BOUNCE,
                    map: map,
                    icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                });

                // When a new spot is selected, delete the old red bouncing marker
                if(lastMarker){
                    lastMarker.setMap(null);
                }

                // Create a new red bouncing marker and move to it
                lastMarker = marker;
                //map.panTo(marker.position);

                // Update Broadcasted Variable (lets the panels know to change their lat, long values)
                googleMapService.clickLat = marker.getPosition().lat();
                googleMapService.clickLong = marker.getPosition().lng();
                $rootScope.$broadcast("clicked");
            });
        };

        // Refresh the page upon window load. Use the initial latitude and longitude
        google.maps.event.addDomListener(window, 'load',
            googleMapService.refresh(selectedLat, selectedLong));

        return googleMapService;
    });

angular
.module('carPoolingApp')
.service('sessionservice', sessionservice);

authservice.$inject = ['$http','$localStorage'];

function sessionservice($http, $localStorage) {
  return {
    set: function(token) {
      return $http.get('/auth/me', {headers: {'Authorization': 'JWT '+ token}}).then(function(user){
        console.log("------user----------");
        console.log(user.data);
        $localStorage.name = user.data.name;
        $localStorage.email = user.data.email;
        $localStorage.photo = user.data.photo;
        $localStorage.id = user.data._id;
        $localStorage.token =token;
        return user.data;
      });  
    },
    check:function() {
      if($localStorage.token){
        return true
      }else{
        return false
      }
    },
    token:function() {
      return $localStorage.token;
    },
    clear:function(){
      $localStorage.$reset();
    },
    user:function(){
      return {
        name: $localStorage.name,
        photo: $localStorage.photo,
        email: $localStorage.email,
        id: $localStorage.id
      }
    }
  };
}
