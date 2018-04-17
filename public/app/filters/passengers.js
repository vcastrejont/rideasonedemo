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
