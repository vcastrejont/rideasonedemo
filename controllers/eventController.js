var Event = require('../models/event');
var Place = require('../models/place');
var User = require('../models/user');
var Ride = require('../models/ride');
var mailerController = require('../controllers/mailerController');
var mongoose = require('mongoose');
var _ = require('lodash');
var error = require('../lib/error');


/**
 * eventController.js
 *
 * @description :: Server-side logic for managing events.
 */
module.exports = {
  /**
   * List all the events from yesterday to the end of the time.
   */
  getFuture: function (req, res, next) {
    Event.getCurrentEvents()
      .then(function (events) {
        res.json(events);
      })
      .catch(next);
  },
  /**
   * List all the events up to yesterday.
   */
  getPast: function (req, res, next) {
    Event.getPastEvents()
      .then(function (events) {
        res.json(events);
      })
      .catch(next);
  },
  /**
   * eventController.getByUser()
   */
  getByUser: function (req, res, next) {
    Event.getUserEvents(req.user._id)
      .then(events => {
        res.json(events);
      })
      .catch(next);
  },
  /**
   * eventController.getById()
   */
  getById: function (req, res, next) {
    var eventId = req.params.event_id;
    Event.findById(eventId)
    .populate('organizer', '_id name photo')
    .populate('place')
    .populate({
      path: 'going_rides returning_rides', 
      populate: {
        path: 'driver passengers.user passengers.place place',
        select: '_id name photo address google_place_id location',
        populate: {
          path: 'user place',
          select: '_id name photo'
        }
      }
    })
    .then(function (event) {
      if (event && !_.isEmpty(event))
        return res.json(event);
      else
        throw new HttpError(404, 'event not found', res); 
      })
      .catch(next);
  },
  /**
   * eventController.create()
   */
  create: function (req, res, next) {
    var newEvent = _.pick(req.body, ['name', 'description', 'address', 'place', 'starts_at', 'ends_at', 'tags']);
    newEvent.place = _.pick(newEvent.place, ['name', 'address', 'google_places_id', 'location']);

    req.user.createEvent(newEvent)
    .then(event => {
       res.json({ _id: event._id });
     })
     .catch(next);
  },
  /**
   * eventController.remove()
  */
  remove: function (req, res, next) {
    req.event.removeEventAndRides()
      .then(() => {
        return res.json('success');
      })
      .catch(next);
  },
  /**
   * eventController.drivers()
   */
  getDrivers: function (req, res) {
    var id = req.params.id;
    Event.aggregate([
      { $match: {
        'attendees.n_seats': {$exists: true},
        '_id': mongoose.Types.ObjectId(id)
      }},
      { $unwind: '$attendees' },
      { $match: {
        'attendees.n_seats': {$exists: true}
      }},
      { '$project': {
        '_id': 0,
        'attendees.user_id': 1,
        'attendees.user': 1,
        'attendees.n_seats': 1
      }}
    ], function (err, result) {
      if (err) {
        console.log(err);
        return;
      }
      return res.json(result);
    });
  },
  /**
   * eventController.byDriver()
   */
  byDriver: function (req, res) {
    var driverId = req.params.id;
    Event.find({'cars.driver_id': mongoose.Types.ObjectId(driverId)}, function (err, events) {
      if (err) {
        return res.json(500, {
          message: 'Error getting event.'
        });
      }
      return res.json(events);
    });
  },
  
  /**
   * eventController.addRide()
   */
  addRide: function (req, res, next) {
    var ride = _.pick(req.body, ['place', 'departure', 'seats', 'comment', 'going', 'returning']);

    ride.driver = req.user._id;
    ride.place = req.body.place || req.user.default_place;
    Event.findOne({_id: req.params.event_id})
    .then(function (event) {
      if(!event) throw error.http(404, "the event doesn't exist");
      return event.addRide(ride);
    })
    .then(function () {
      return res.status(200).json({
        message: 'Successfully added!',
      });
    })
    .catch(next);
  },
  edit: function (req, res, next) {
    var updates = _.pick(req.body, ['name', 'place', 'description', 'starts_at', 'ends_at', 'tags']); 
    _.assign(req.event, updates);
    
    req.event.save()
    .then(event => {
      return res.status(200).json({
        message: 'Successfully edited',
      });
    })
    .catch(next);
  },

  /**
   * eventController.signup()  Event sign up
   */
  signup: function (req, res) {
    var id = req.params.id;
    var attendees = {
      user_id: req.user.id,
      user: req.user.name,
      photo: req.user.photo,
      lift: false,
      comments: req.body.comments
    };
    Event.findOne({_id: id}, function (err, event) {
      if (err) {
        return res.json(500, {
          message: 'Error accesing event', error: err
        });
      }
      if (!event) {
        return res.json(404, {message: 'No such event'});
      }
      Event.findOne({'_id': id, 'attendees.user_id': req.user.id}, function (err, attendee) {
        if (attendee) {
          console.log('Already exists');
          return res.json(200, {message: 'Already signed'});
        } else {
          Event.update({'_id': id}, {$push: {'attendees': attendees}}, function (err, numAffected) {
            if (err) {
              console.log(err);
            } else {
              console.log('Successfully added to event');
              return res.json(200, {message: 'Successfully added to event'});
            }
          });
        }
      });
    });
  },

  messageDriver: function(req, res) {
      var eventId = req.params.id;
      var carId = req.params.carId;
      if(!req.body.message) return res.json(400, { message: 'The message is required' });

      eventModel.findById(eventId, function(err, event) {
          if(err) return res.json(500, { message: 'Error getting event.' });

          var car = _.find(event.cars, function(car) {
              return car['_id'] == carId;
          });

          if(!car) return res.json(400, { message: 'Invalid car ID' });

          mailerController.messageDriver({
              driver_email: car.driver_email,
              content: req.body.message,
              user_email: req.user.email
          }, function (err, response) {
              if (err) return res.send(500, { message: 'Error sending message' });

              console.log("Mail sent to: " + car.driver_email);
              res.sendStatus(200);
          })

      });
  }
};
