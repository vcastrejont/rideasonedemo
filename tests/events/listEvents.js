var supertest = require('supertest-as-promised');
var port = process.env.PORT|| 3000;
var req = supertest('http://localhost:'+ port +'/api');
var assert = require('chai').assert;
var sinon = require('sinon');
var util = require('../util');
var User = require('../../models/User');
var Event = require('../../models/Event');
var Place = require('../../models/Place');
var token, testUser, testEvent1, testEvent2, testPlace;

describe('Event listing', function(){
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
        place: place, 
        organizer: testUser._id, 
        starts_at: new Date("2017-05-05T02:20:10Z"), 
        tags: ['feria', 'pollo']
      })
      .save();
    })
    .then(event => {
       testEvent1 = event;
       return new Event({
         name: "feria del pollo Z", 
         description: "una feria de pollos", 
         place: testPlace, 
         organizer: testUser._id, 
         starts_at: new Date("2017-05-05T02:20:10Z"), 
         tags: ['feria', 'pollo']
       })
       .save();
     })
     .then(event => {
       testEvent2 = event;
     });
  });

  after(() => {
    return testUser.remove()
    .then(() => testEvent1.remove())
    .then(() => testEvent2.remove())
    .then(() => testPlace.remove()); 
  });

  it('returns an array of future events', () => {
    return Event.getCurrentEvents()
    .then(events => {
      assert.isArray(events);
      assert.lengthOf(events, 2);
    });
  });

  it('returns an array of past events', () => {
    var clock = sinon.useFakeTimers(new Date("2017-06-06T00:00:00Z").valueOf());
    return Event.getPastEvents()
    .then(events => {
      assert.isArray(events);
      assert.lengthOf(events, 2);
      clock.restore();
    });
  })

  it('returns a single event by ID', () => {
    return req.get('/events/'+ testEvent1._id)
    .set('Authorization', token)
    .expect(200)
    .then(res => {
      var event = res.body;
      assert.equal(event._id, testEvent1._id);
      assert.equal(Date(event.created_at), Date(testEvent1.created_at));
      assert.equal(Date(event.starts_at), Date(testEvent1.starts_at));
      assert.equal(event.name, 'feria del pollo');
      assert.equal(event.description, 'una feria de pollos');
      assert.lengthOf(event.going_rides, 0);
      assert.lengthOf(event.returning_rides, 0);
      assert.equal(event.organizer._id, testEvent1.organizer);
      assert.equal(event.place._id, testPlace._id);
      assert.equal(event.place.location.lat, testPlace.location.lat);
      assert.equal(event.place.location.lon, testPlace.location.lon);
      assert.equal(event.place.address, testPlace.address);
      assert.equal(event.place.name, testPlace.name);
      assert.equal(event.place.google_places_id, testPlace.google_places_id);
      assert.deepEqual(event.tags, ['feria', 'pollo']);
    });
  });

});
