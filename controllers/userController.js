var userModel = require('../models/user.js');
var mongoose = require('mongoose');
/**
 * userController.js
 *
 * @description :: Server-side logic for managing users.
 */
module.exports = {
    /**
     * eventController.list()
     */
    list: function(req, res) {
      userModel.find()
        .then(users => {
          return res.json(200, users);
		})
		.catch(err => {
          return res.json(500, {message: 'Error getting users'});
		});
    },
	
	updateFcmToken: function (req, res) {
      req.user.updateFcmToken(req.body)
        .then(user => {
	      return res.json(200, {message: 'FCM token updated successfully'});	
		})
	    .catch(err => {
		  return res.json(500, {message: 'Error updating token'})
		});
	}
};
