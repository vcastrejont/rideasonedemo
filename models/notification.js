var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var fcm = require('../lib/fcm').instance;
var frd = require('../lib/frd');
var fcmInstance = fcm.instance;
var _ = require('lodash');
var Promise = require('bluebird');
var error = require('../lib/error');
var mail = require('../lib/mailer');

var Status = ["PENDING", "SENT", "READ", "ERROR"];

var NotificationSchema = new Schema({
  recipient: {type: ObjectId, ref: "user"},
  sender: {type: ObjectId, ref: "user"},
  status: {type: String, default: "PENDING", enum: Status},
  type: String,
  subject: ObjectId,
  message: String,
  created_at: {type: Date, default: Date.now}
});

NotificationSchema.statics.addNotification = function (data, transaction) {
  var tokens = _.get(data, 'recipient.tokens');
  var promise = Promise.resolve(); 
  var notification = {
    recipient: data.recipient.id,
    sender: data.sender._id,
    status: 'SENT', 
	  type: data.type,
	  subject: data.subject._id,
    message: data.message
  };

  promise = promise.then(() => {
    transaction.insert('notification', notification);
    return transaction.run();
  })
  .then(notifications => {
     data.notification = notifications[0];
     return mail.send(data.type, {
      to: {
        address: data.recipient.email,
        locals: data 
      },
      subject: data.message
    });
  })
  .then(notification => {
    return frd.ref('notifications').child(data.recipient.id)
      .transaction(value => value === null ? 1 : value + 1);
  });
 
  if(tokens && tokens.length){	
    promise.then(() => {
      return fcm.send({
        to: tokens,
        notification: {
          body: data.message
        }
      });
    });
  }

  return promise; 
  
}

var Notification = mongoose.model('notification', NotificationSchema);

module.exports = Notification;

