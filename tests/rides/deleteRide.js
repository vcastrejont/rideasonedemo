var supertest = require('supertest-as-promised');
var port = process.env.PORT|| 3000;
var req = supertest('http://localhost:'+ port +'/api');
var assert = require('chai').assert;
var Promise = require('bluebird');
var sinon = require('sinon');
var util = require('../util');
var User = require('../../models/User');
var Event = require('../../models/Event');
var Place = require('../../models/Place');
var Ride = require('../../models/Ride');
var _ = require('lodash');
var token, testUser, testEvent, testRides, testPlace;

describe('Ride removal', function(){
  before(() => {
    return new User({
      name:'test', 
      email:'test@test.com', 
      provider_id: Date.now()
    })
    .save()
    .then((user) => {
      testUser = user;
      return new Place({
        address: 'avenida Siempreviva #43', 
        place_name: "ferialandia", 
        location: {lat: 123, lon: 456} 
      })
      .save();
    })
    .then(place => {
      testPlace = place;
      return new Event({
        name: "feria del pollo", 
        description: "una feria de pollos", 
        address: "pollolandia", 
        location: {lat: 123, lon: 123}, 
        place: place._id, 
        organizer: testUser._id, 
        starts_at: new Date("2017-05-05T02:20:10Z"), 
        tags: ['feria', 'pollo']
      })
      .save();
    })
    .then(event => {
      return event.addRide({
        driver: testUser._id,
        seats: 4,
        comments: 'asdf',
        place: {
          google_places_id: 'asdfasdf',
          seats: 4,
          address: 'aaaaaaaaaaa',
          location: {lat: 8, lon: 5}
       },
       going: true,
        returning: true
      })
      .return(event);
    })
    .then(event => {
      return event.addRide({
        driver: testUser._id,
        seats: 4,
        comments: 'ñlkj',
        going: true,
        place: {
          google_places_id: 'asdfasdf',
          seats: 4,
          address: 'aaaaaaaaaaa',
          location: {lat: 8, lon: 5}
        },
        returning: true
      })
      .return(event);
    })
    .then(event => {
      testEvent = event;
      testRides = event.going_rides;
      testRides.concat(event.returning_rides);
    });
  });

  after(() => {
    return testUser.remove()
    .then(() => testEvent.remove())
    .then(() => {
      var promises = [];
      testRides.forEach(rideId => {
        promises.push(Ride.remove({_id: rideId}));  
      });
      return Promise.all(promises);
    })
    .then(() => testPlace.remove()); 
  });

  it('pulls a single ride from the event and removes that ride', () => {
    return Ride.findOne({_id: testEvent.going_rides[1]})
    .then(ride => ride.cancelEventRide(testEvent))
    .then(event => {
      var ride = testEvent.going_rides[1];
      assert.notInclude(event.going_rides, ride);
      assert.include(event.going_rides, testEvent.going_rides[0]);
      assert.include(event.returning_rides, testEvent.returning_rides[0]);
      assert.include(event.returning_rides, testEvent.returning_rides[1]);
    });
  });

});
