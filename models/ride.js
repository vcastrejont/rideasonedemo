var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Transaction = require('lx-mongoose-transaction')(mongoose);
var Promise = require('bluebird');
var Notification = require('./notification');
var error = require('../lib/error');

var Status = ['PENDING', 'TRANSIT', 'FINISHED', 'CANCELED'];

var RideSchema = new Schema({
  place: { type: ObjectId, ref: 'place' },
  driver: { type: ObjectId, ref: 'user', required: true },
  departure: Date,
  seats: Number,
  comment: String,
  passengers: [{
    _id: false,
    user: { type: ObjectId, ref: 'user' },
    place: { type: ObjectId, ref: 'place' }
  }],
  status: { type: String, default: "PENDING", enum: Status },
  chat: [{ type: ObjectId, ref: 'message' }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

RideSchema.methods.postMessage = function (userId, text) {
  return new Promise((resolve, reject) => {
    var Message = require('./message');
    var message = new Message({
      author: userId,
      content: text
    });
    message.save()
      .then(() => {
        this.chat.push(message);
        return this.save();
      })
      .then(resolve)
      .catch(reject);
  });
};

function appendEvent(ride){
  var Event = require('./event');
  var query = {$or:[
   {going_rides: ride._id}, 
   {returning_rides: ride._id}
  ]};

  var promise = Event.findOne(query)
    .then(event => {
      if (event) {
        ride._doc.event = event._id;
      } else {
        ride._doc.event = 'event Missing';
      }
    });

  return promise;
}

RideSchema.statics.getUserRides = function (userId) {
  var query = {
    departure: {$gt: new Date().toUTCString()},
    $or: [
      {driver: userId},
      {passengers: {$elemMatch: {user: userId}}}
    ]
  };

  return Ride.find(query)
    .populate('driver', 'name photo email _id')
    .populate('place')
    .populate({
      path: 'passengers.user passengers.place',
      select: 'name email photo _id location address google_places_id'
    })
    .sort('departure')
    .then(rides => {
      var promises = [];

      rides.forEach((ride, i) => {
        promises.push(appendEvent(ride));
      });
      return Promise.all(promises).return(rides);
    });

}

RideSchema.methods.leave = function (user) {
  var transaction = new Transaction();
  
  return this.update({'$pull': {'passengers': {'user_id': user._id}}})
    .then(() => {
      return Ride.populate(this, {path:'driver'});
    })
	  .then(ride => {
      var notificationData = {
	      recipient: {
		      tokens: ride.driver.tokens,
		      id: ride.driver._id.toString(),
  	    },
        sender: user.id,
	      message: user.name +' has cancelled a spot on your ride',
	    	subject: ride._id,
	  	  type: 'ride cancellation'
	    };
	  
      return Notification.addNotification(notificationData, transaction);
    });
}

RideSchema.methods.notifyPassengers = function (notification, transaction) {

  return Ride.populate(this, {path:'passengers'})
  .then(ride => {
    var promises = [];
    ride.passengers.forEach(user => {
      promises.push(Notification.addNotification(_.merge({
        recipient: {
          tokens: user.tokens,
          id: user.id
        }
      }), notification), transaction);
    });
    return Promise.all(promises);
  });

};

RideSchema.methods.cancelEventRide = function(event) {
  var Event = require('./event');
  var transaction = new Transaction();
 
  return Event.findOne({_id: event._id})
  .then(event => {
    if(!event) throw error.http(404, "the event doesn't exist"); 
    var promises = [];
    event.going_rides.pull({_id: this._id});
    event.returning_rides.pull({_id: this._id});

    var updatedRides = {
      going_rides: event.going_rides,
      returning_rides: event.returning_rides
    };

    transaction.update('event', event._id, updatedRides);
    transaction.update('ride', this._id, {status: 'CANCELED'});
    return transaction.run()
      .return(event)
  })
  .then(event => {
    return this.notifyPassengers({
      type: 'Ride Canceled',
      sender: this.driver,
      subject: this.id,
      message: 'Your ride to '+ event.name +' has been canceled'
    }, transaction)
    .return(event);
  })
  .catch(err => {throw new Error(error.toHttp(err))});
}

var Ride = module.exports = mongoose.model('ride', RideSchema);
