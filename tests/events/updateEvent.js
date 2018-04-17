var supertest = require('supertest-as-promised');
var port = process.env.PORT|| 3000;
var req = supertest('http://localhost:'+ port +'/api');
var assert = require('chai').assert;
var sinon = require('sinon');
var util = require('../util');
var User = require('../../models/User');
var Event = require('../../models/Event');
var Place = require('../../models/Place');
var Ride = require('../../models/Ride');
var token, testUser, testEvent, testPlace;

describe('Event editing', function(){
  before(() => {
    return new User({
      name:'test', 
      email:'test@test.com', 
      provider_id: Date.now()
    })
    .save()
    .then(user => { 
      testUser = user;
      return util.getTokenForUser(user._id);
    })
    .then((_token) => {
      token = _token
      return new Place({
        address: 'avenida Siempreviva #43', 
        place_name: "ferialandia", 
        location: {lat: 123, lon: 123} 
      })
      .save();
    })
    .then(place => {
      testPlace = place;
      return new Event({
        name: "feria del pollo", 
        description: "una feria de pollos", 
        address: "pollolandia", 
        location: {lat: 123, lon: 456}, 
        place: place._id, 
        organizer: testUser._id, 
        starts_at: new Date("2017-05-05T02:20:10Z"), 
        tags: ['feria', 'pollo']
      })
      .save();
    })
    .then(event => {
       testEvent = event;
    });
  });

  after(() => {
    return testUser.remove()
    .then(() => testEvent.remove())
    .then(() => testPlace.remove()); 
  });

  it('edits a given user', () => {
    var eventUpdates = {
      place: testPlace._id,
      description: 'feria de los pollos',
      tags: ['pollos']
    };

    return req.put('/events/'+ testEvent._id)
    .set('Authorization', token)
    .send(eventUpdates)
    .expect(200)
    .then(res => {
      return Event.findOne({_id: testEvent._id});
    })
    .then(event => {
      assert.equal(Date(event.created_at), Date(testEvent.created_at));
      assert.equal(Date(event.datetime), Date(testEvent.datetime));
      assert.equal(event.name, 'feria del pollo');
      assert.equal(event.description, 'feria de los pollos');
      assert.lengthOf(event.going_rides, 0);
      assert.lengthOf(event.returning_rides, 0);
      assert.equal(event.organizer, testUser._id.toString());
      assert.equal(event.place, testPlace._id.toString());
      assert.lengthOf(event.tags, 1);
      assert.equal(event.tags[0], ['pollos']);
    });
  });

  it('adds a ride to an event', () => {
    var updatedEvent;
    var rideData = {
      driver: testUser._id,
      seats: 42,
      comments: 'yolo',
      going: true,
      place: {
        google_places_id: 'asdfasdf',
        address: 'aaaaaaaaaaa',
        location: {lat: 8, lon: 5}
      },
      returning: true
    };
    return testEvent.addRide(rideData)
    .then(updatedEvents => {
      var event = updatedEvent = updatedEvents[0];
      assert.lengthOf(event.going_rides, 1);
      assert.lengthOf(event.returning_rides, 1);

      return Ride.findOne({_id: event.going_rides[0]});
    })
    .then(ride => {
        assert.equal(ride.seats, 42);
        assert.equal(ride.driver, testUser._id.toString());

        return Ride.findOne({_id: updatedEvent.returning_rides[0]});
    })
    .then(ride => {
        assert.equal(ride.seats, 42);
        assert.equal(ride.driver, testUser._id.toString());
    });
  });

});
