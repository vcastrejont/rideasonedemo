var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Transaction = require('lx-mongoose-transaction')(mongoose);
var Notification = require('./notification');

var RideRequestSchema = new Schema({
  passenger: { type: ObjectId, ref: 'user' },
  place: { type: ObjectId, ref: 'place'},
  ride: { type: ObjectId, ref: 'ride' },
  created_at: { type: Date, default: Date.now }
});

/**
 * Accepts the request by adding the passenger to the ride and then deleting itself
 *
 * @return a Promise
 */
RideRequestSchema.methods.accept = function () {
    var transaction = new Transaction();

    var passenger = {
      user: this.passenger,
      place: this.place
    };
    
    this.ride.passengers.push(passenger);
    transaction.update('ride', {_id: this.ride._id}, {passengers: this.ride.passengers});
    transaction.remove('rideRequest', this._id);

    return transaction.run()
      .then(() => {
        var notificationData = {
          recipient: {
            tokens: this.passenger.fcm_tokens,
            id: this.passenger._id.toString(),
            email: this.passenger.email,
            name: this.passenger.name
          },
          sender: this.ride.driver,
          message: this.ride.driver.name +' accepted to give you a ride',
          subject: this.ride,
          type: 'ride-request-accepted'
	      };
        return Notification.addNotification(notificationData, transaction);
      })
      .catch(() => {
        return transaction.rollback()
          .then((err) => {throw new Error('transaction error, please try again' + err)});
      })

};

RideRequestSchema.methods.reject = function (userId) {
    var transaction = new Transaction();

    var passenger = this.passenger;
    
    this.ride.passengers.push(passenger);
    transaction.update('ride', {_id: this.ride._id}, {passengers: this.ride.passengers});
    transaction.remove('rideRequest', this._id);

    return transaction.run()
      .then(() => {
        var notificationData = {
          recipient: {
            tokens: passenger.fcm_tokens,
            id: passenger._id.toString(),
            email: passenger.email,
            name: passenger.name
          },
          sender: this.ride.driver,
          message: 'Your ride with '+ this.ride.driver.name +' was declined',
          subject: this.ride,
          type: 'ride-request-rejected'
	      };
        return Notification.addNotification(notificationData, transaction);
      })
      .catch(() => {
        return transaction.rollback()
          .then((err) => {throw new Error('transaction error, please try again' + err)});
      })


};

module.exports = mongoose.model('rideRequest', RideRequestSchema);
