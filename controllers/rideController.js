var Event = require('../models/event');
var Ride = require('../models/ride');
var RideRequest = require('../models/rideRequest');
var Promise = require('bluebird');
var error = require('../lib/error');
var _ = require('lodash');

module.exports = {
  deleteRide: function (req, res, next) {
    req.ride.deleteEventRide(req.params.event)
      .then(results => {
        var numAffected = results.length;
        return res.status(200).json({
          message: 'Successfully deleted',
        });
      })
      .catch(next);
  },
  
  joinRide: function (req, res, next) {
    req.user.requestJoiningRide(req.params.ride_id, req.body.place)
      .then(rideRequest => {
        return res.status(200).json({
          message: 'Successfully added!'
        });
      })
      .catch(next);
  },
  getByUser: function (req, res, next) {
    Ride.getUserRides(req.params.user_id)
      .then(rides => {
        return res.status(200).json(rides)
      })
      .catch(next);
  },
  addPassenger: function (req, res) {
    var event_id = req.body.event_id;
    var car_id = req.body.car_id;
    var extra = req.body.extra;
    var passenger = {
      user_id: req.user.id,
      name: req.user.name,
      photo: req.user.photo
    };
    for (i = 0; i < extra; i++) {
      Event.update({_id: event_id, 'cars._id': car_id },
        {'$push': {'cars.$.passengers': passenger}},
        function (err, numAffected) {
          if (err) {
            console.log(err);
            return res.status(500).json({
              message: 'Error updating event', error: err
            });
          } else {
            // nothing here
          }
        });
    }
    return res.status(200).json({
      message: 'Successfully added!'
    });

  },
  leaveRide: function (req, res, next) {
    req.ride.leave(req.user)
    .then(numAffected => {
      return res.status(200).json({
        message: 'Successfully removed',
      });
    })
    .catch(next);
    },

  acceptRideRequest: function (req, res, next) {
    return RideRequest.findOne({_id: req.params.request_id, ride: req.params.ride_id})
    .populate('ride')
  	.populate('passenger')
    .then(request => {
      return request.accept();
    })
	  .then(results => {
      return res.status(200).json({
        message: 'successfully accepted ride',
      });
    })
    .catch(next);
    
  },
  rejectRideRequest: function (req, res, next) {
    return RideRequest.findOne({_id: req.params.request_id, ride: req.params.ride_id})
    .populate('ride')
  	.populate('passenger')
    .then(request => {
      return request.reject();
    })
	  .then(results => {
      return res.status(200).json({
        message: 'successfully rejected ride',
      });
    })
    .catch(next);
    
  }
};
