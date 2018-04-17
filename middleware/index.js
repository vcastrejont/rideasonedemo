var passport = require('passport');
var error = require('../lib/error');

module.exports = {
  isAuthenticated: passport.authenticate('jwt', { session: false }),
  isPassenger: isPassenger,
  isOrganizer: isOrganizer,
	isDriver: isDriver,
  ownsRideRequest: ownsRideRequest,
  isOwn: isOwn
};

function isOwn(req, res, next) {
  if(req.params.user_id !== req.user._id.toString()){
    next(new Error('this view does not belong to the user')); 
  }
  next();
}

function isPassenger (req, res, next) {
  var rideId = req.body.ride_id || req.params.ride_id;
  if (!rideId) return next(error.http(400, 'a ride_id is required')) 
  req.user.isPassenger(rideId)
    .then((ride) => {
      req.ride = ride;
      return next();
    })
    .catch(next);
}

function isDriver (req, res, next) {
  var rideId = req.body.ride_id || req.params.ride_id;
  if (!rideId) return next(error.http(400, 'a ride_id is required')) 
  req.user.isDriver(rideId)
    .then((ride) => {
      req.ride = ride;
      return next();
    })
    .catch(next);
}

function ownsRideRequest(req, res, next) {
  var requestId = req.body.request_id || req.params.request_id; 
  if(!requestId) return next(error.http(400), 'a request_id is required');
  req.user.ownsRideRequest(requestId)
    .then(request => {
      req.rideRequest = request;
      return next();
    })
    .catch(next);
}

function isOrganizer (req, res, next) {
  var eventId = req.body.event_id || req.params.event_id;
  if (!eventId) return next(error.http(400, 'an event_id is required')) 

  req.user.isOrganizer(eventId)
    .then((event) => {
      req.event = event;
      return next();
    })
    .catch(next);
}
