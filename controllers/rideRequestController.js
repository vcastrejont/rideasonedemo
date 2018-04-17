var RideRequest = require('../models/rideRequest');
var Promise = require('bluebird');
var error = require('../lib/error');
var _ = require('lodash');

module.exports.get = function (req, res, next) {
  return req.rideRequest
    .populate('passenger', 'name photo _id')
    .populate('place')
    .populate({
      path: 'ride',
      populate: {
        path: 'place passengers.user passengers.place driver',
        select: 'name photo _id location address google_places_id',
      }
    })
    .execPopulate()
    .then(request => {
      res.json(request);
    })
    .catch(next);

}
