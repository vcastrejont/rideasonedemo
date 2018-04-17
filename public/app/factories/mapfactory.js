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
