var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Transaction = require('lx-mongoose-transaction')(mongoose);
var Promise = require('bluebird');
var Ride = require('./ride');
var _ = require('lodash');
var util = require('../lib/util');
var error = require('../lib/error');

var EventSchema = new Schema({
  place: { type: ObjectId, ref: 'place' },
  organizer: { type: ObjectId, ref: 'user' },
  name: String,
  description: String,
  starts_at: {type: Date, required: true},
  ends_at: Date,
  tags: Array,
  going_rides: [{ type: ObjectId, ref: 'ride' }],
  returning_rides: [{ type: ObjectId, ref: 'ride' }],
  created_at: {type: Date, default: Date.now},
  updated_at: {type: Date, default: Date.now}
});

/**
 * Gets all of the events scheduled for 2 hours ago and later.
 *
 * @return A promise with the signature (events: [Event])
 */
EventSchema.statics.getCurrentEvents = function () {
  var twoHoursAgo = moment().subtract(2, 'hour').toDate();
  return Event.find({ starts_at: { $gte: twoHoursAgo} })
    .populate('place')
    //ToDo: only passengers and organizers should see emails
    .populate('organizer', '_id name photo email')
    .populate({
      path: 'going_rides returning_rides', 
      populate: {
        path: 'driver passengers.user passengers.place place',
        select: '_id name photo email location address google_places_id',
        populate: {
          path: 'user place',
          select: '_id name photo email'
        }
      }
	  })
    .sort('starts_at');
};

EventSchema.statics.getUserEvents = function (userId) {
  var today = moment().startOf('day').toDate().toUTCString();

  return Event.find({
    starts_at: {$gt: today},
    organizer: userId
  })
  .populate('organizer', '_id name photo email')
  .populate('place')
  .populate({
    path: 'going_rides returning_rides', 
    populate: {
      path: 'driver passengers.user passengers.place',
      populate: {
        path: 'user place',
        select: '_id name photo email'
      }
    }
  })
  .sort('starts_at');
 
};

/**
 * Gets the last 50 events that where scheduled before 2 hours ago.
 *
 * @return A promise with the signature (events: [Event])
 */
EventSchema.statics.getPastEvents = function () {
  var twoHoursAgo = moment().subtract(1, 'hour').toDate();
  return Event.find({ starts_at: { $lt: twoHoursAgo } })
  .populate('place')
  //ToDo: only passengers and organizers should see emails
  .populate('organizer', '_id name photo email')
  .populate({
    path: 'going_rides', 
    populate: {
      path: 'driver passengers.user passengers.place place',
      select: '_id name photo email location address google_places_id',
      populate: {
        path: 'user place',
        select: '_id name photo email'
      }
    }
	})
	.sort('-starts_at').limit(50);
};

function createRide(ride, path, transaction) {
  return util.findOrCreatePlace(ride.place, transaction)
    .then(places => {
      ride.place = places[0]._id;
      transaction.insert('ride', ride);
      return transaction.run()
    })
    .then(createdRides => {
      this[path].push({_id: createdRides[0]._id});
    })
    .catch(err => {throw new Error(error.toHttp(err))});
}

EventSchema.methods.addRide = function (rideData) {
  var transaction = new Transaction();

  var ride = {
    driver: rideData.driver,
    seats: rideData.seats,
    comments: rideData.comments,
    place: rideData.place,
    departure: rideData.departure
  };

  var promises = [];
  if(rideData.going === true){
    promises.push(createRide.call(this, ride, 'going_rides', transaction)); 
  }
  if(rideData.returning === true){
    promises.push(createRide.call(this, ride, 'returning_rides', transaction));
  }

  return Promise.all(promises)
    .then(() => {
      transaction.update('event', {'_id': this._id}, {
        going_rides: this.going_rides, 
        returning_rides: this.returning_rides
      });
      return transaction.run()
      .catch(err => {throw new Error(error.toHttp(err))});
    });

};

EventSchema.methods.removeEventAndRides = function () {
  var transaction = new Transaction();

  this.populate('going_rides returning_rides')
  var rides = _.concat(this.going_rides, this.returning_rides);
  var promises = [];
  transaction.remove('event', this._id);

  rides.forEach(ride => {
    /*ToDo: notify driver and passengers*/
    promises.push(ride.notifyPassengers({
      subject: this._id,
      type: 'Event Canceled',
      message: 'The event '+ this.name +' has been canceled'
    }));

    transaction.remove('ride', ride);
  });

  return Promise.all(promises)
    .then(() => transaction.run())
    .return(results => results[0]);
}

var Event = mongoose.model('event', EventSchema);
module.exports = Event;
