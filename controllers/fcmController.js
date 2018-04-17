var config = require('../config/config');
var userModel = require('../models/user.js');
var PushMessageModel = require('../models/PushMessageModel.js');

var FCM = require('../lib/fcm').FCM;

var fcm = new FCM(config.fcm.SERVER_API_KEY);

function sendMessageToAllDevices(user, data) {
    user.firebaseTokens.forEach(function(element, index, array) {
        var pushMessageModel = new PushMessageModel();
        var fcmInfo = {
            to: element.token,
            data: data
        };
        pushMessageModel.fcm = fcmInfo;

        pushMessageModel.save(function(err) {
            if (err) return;

            fcm.send(fcmInfo, function(err, messageId) {
                if (err) {
                    console.log("Something has gone wrong!", err);
                    pushMessageModel.error = err;
                    pushMessageModel.status = "ERROR";
                } else {
                    console.log("Sent with message ID: ", messageId);
                    pushMessageModel.messageId = messageId;
                    pushMessageModel.status = "SENT";
                }
                pushMessageModel.save();
            });
        });
    });
}

/**
 * fcmController.js
 *
 * @description :: Firebase cloud messaging controller to handle push notifications.
 */
module.exports = {
    /**
     * Assigns a firebase cloud message token to the current user.
     */
    registerUserToken: function(req, res) {
        userModel.findOne(
            {
                'firebaseTokens.token': { $in: [ req.query.deviceRegistrationId ] }
            },
            function(err, user) {
                if(err) return res.status(404).json(err);

                if (user) return res.status(200).json(user);

                userModel.findByIdAndUpdate(
                    req.user.id,
                    {
                        $addToSet: {
                            firebaseTokens: {
                                platform: req.query.platform,
                                token: req.query.deviceRegistrationId
                            }
                        }
                    },
                    {
                        new: true
                    },
                    function(err, user) {
                        if (err) return res.status(404).json({message: 'User not found.'});

                        return res.status(200).json(user);
                    }
                );
            }
        );
    },
    send: function(req, res) {
        // TODO: Get current user.
        userModel.findOne(function(err, user) {
            if(err) return res.status(404).json(err);

            sendMessageToAllDevices(user, {
                message: "Hello world!"
            });
            return res.status(200).json(user);
        });
    }
}
