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
