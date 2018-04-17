var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Transaction = require('lx-mongoose-transaction')(mongoose);
var Place = require('./place');
var Event = require('./event');
var error = require('../lib/error');
var util = require('../lib/util');

var UserSchema = new Schema({
  name: String,
  provider: String,
  provider_id: {type: String, unique: true},
  photo: String,
  email: {type:String, unique:true},
  fcm_tokens: [String],
  created_at: {type: Date, default: Date.now},
  default_place: {type: Schema.Types.ObjectId, ref: 'place'}
});

UserSchema.virtual('profile').get(function () {
  return {
    _id: this.id,
    name: this.name,
    email: this.email,
    photo: this.photo
  };
});

/**
 * Gets all the events in which the user is either the organizer or the driver of one of the rides
 *
 * @return Apromise with signature (events: [Event])
 */
UserSchema.methods.getEvents = function () {
  var Event = require('./event');
  var Ride = require('./ride');
  var moment = require('moment');

  var today = moment().startOf('day').toDate();
  return Ride
    .find({ driver: this })
    .then(rides => {
      return Event
        .find({ datetime: { $gte: today } })
        .or([
          { organizer: this },
          { going_rides: { $in: rides } },
          { returning_rides: { $in: rides } }
        ])
        .populate('organizer', '_id name photo')
        .populate('place')
        .populate({
          path: 'ride', 
          populate: {
            path: 'passengers ',
            populate: {
              path: 'user place',
              select: '_id name photo'
            }
          }
        })
        .sort('datetime');
    });
};

/**
 *
 * @returns A promise with signature (event: Event)
 */

UserSchema.methods.updateFcmToken = function (data) {
  var tokens = this.fcm_tokens;
  tokens.pull(data.old);
  if(tokens.indexOf(data.active) == -1) tokens.push(data.active);
  return this.save();
};

UserSchema.methods.createEvent = function (data) {
  var transaction = new Transaction();

  return util.findOrCreatePlace(data.place, transaction)
  .then(places => {
    var event = {
      place: places[0]._id,
      organizer: this,
      name: data.name,
      description: data.description,
      starts_at: data.starts_at,
      ends_at: data.ends_at,
      tags: data.tags
    };
    transaction.insert('event', event);
    return transaction.run()
  })
  .then(ev => ev[0]._doc)
  .catch(err => {throw new Error(error.toHttp(err))});

};

UserSchema.methods.requestJoiningRide = function (rideId, place) {
  var RideRequest = require('./rideRequest');
  var Notification = require('./notification');
  var transaction = new Transaction();

  /*ToDo: check if ride exists*/

  return util.findOrCreatePlace(place, transaction)
    .then(places => {
      var request = {
        ride: rideId,
        passenger: this,
        place: places[0]._id
      };
      transaction.insert('rideRequest', request);
      return transaction.run(); 
    })
    .then(requests => {
      return RideRequest.populate(requests[0], {path: 'ride', populate:{path: 'driver'}});
    })
    .then(request => {
      /*ToDo: error when ride doesn't exist */
      var notificationData = {
	      recipient: {
		      tokens: request.ride.driver.fcm_tokens,
  		    id: request.ride.driver._id.toString(),
          email: request.ride.driver.email,
          name: request.ride.driver.name
	      },
        sender: this,
	      message: this.name +' is requesting to join your ride',
		    subject: request,
		    type: 'ride-request'
	    };
      console.log(request.ride.driver, notificationData.recipient);
      return Notification.addNotification(notificationData, transaction)
        .return(request);
    })
    .catch(err => {throw new Error(error.toHttp(err))});
};

UserSchema.methods.isPassenger = function (rideId) {
  var Ride = require('../models/ride');
  return Ride.findOne({_id: rideId, 'passengers.user': this})
    .then(ride => {
      if (!ride) {
        throw new Error(error.http(403, 'user is not a passenger of this ride'));
      }
      return ride;
    });
};

UserSchema.methods.isDriver = function (rideId) {
  var Ride = require('../models/ride');
  return Ride.findOne({ _id: rideId, driver: this })
    .then(ride => {
      if (!ride) {
        throw new Error(error.http(403, 'user is not the driver of this ride'));
      }
      return ride;
    });
};

UserSchema.methods.ownsRideRequest = function (requestId) {
  var RideRequest = require('../models/rideRequest');
  return RideRequest.findOne({_id: requestId})
    .populate('ride')
    .then(request => {
      var userId = this._id.toString();
      if(!request || !(request.passenger.toString() === userId || request.ride.driver.toString() === userId)){
        throw new Error(error.http(403, 'user is not the passenger or driver of this ride request'));
      }
      return request;
    });
}

UserSchema.methods.isOrganizer = function (eventId) {
  var Event = require('../models/event');
  return Event.findOne({ _id: eventId, organizer: this._id})
    .then((event) => {
      if (!event) {
        throw new Error(error.http(403, 'user is not the organizer of this event or event doesn\'t exist'));
      }
      return event;
    });
};

module.exports = mongoose.model('user', UserSchema);

