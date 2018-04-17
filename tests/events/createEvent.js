var supertest = require('supertest-as-promised');
var assert = require('chai').assert;
var User = require('../../models/User');
var Place = require('../../models/Place');
var Event = require('../../models/Event');
var token, testUser, testPlace1, testPlace2, createdEvent;

describe('Event creation', function(){
  before(() => {
    return new User({
      name:'test', 
      email:'test@test.com', 
      provider_id: Date.now()
    })
    .save()
    .then(user => {
      testUser = user;
      return new Place({
        address: 'avenida Siempreviva #43', 
        place_name: 'ferialandia', 
		google_places_id: 'testGooglePlaceId',
        location: {lat: 123, lon: 123}
      })
      .save();
    })
    .then(place => {
      testPlace1 = place;
    });
  });

  after(() => {
    return testUser.remove()
    .then(() => testPlace1.remove()) 
    .then(() => testPlace2.remove())
    .then(() => Event.remove(createdEvent1))
    .then(() => Event.remove(createdEvent2));
  });

  it('creates a new event with existing place', () => {
    return testUser.createEvent({
      name: 'feria del pollo Z', 
      description: 'una feria de pollos', 
      place: testPlace1, 
      organizer: testUser._id, 
      starts_at: new Date('2017-05-05T02:20:10Z'), 
      tags: ['feria', 'pollo']
    })
    .then(event => {
      createdEvent1 = event;
      assert.ok(event._id);
      assert.equal(Date(event.starts_at), Date('2017-05-05T02:20:10Z'));
      assert.equal(event.name, 'feria del pollo Z');
      assert.equal(event.description, 'una feria de pollos');
      assert.lengthOf(event.going_rides, 0);
      assert.lengthOf(event.returning_rides, 0);
      assert.equal(event.organizer._id, testUser._id);
      assert.equal(event.place.toString(), testPlace1._id.toString());
      assert.equal(event.tags[0], 'feria');
      assert.equal(event.tags[1], 'pollo');
    });
  })

  it('creates a new place from data given for new event', () => {
    return testUser.createEvent({
      name: 'feria del pollo Z', 
      description: 'una feria de pollos', 
      organizer: testUser._id, 
	  place: {
		address: 'pollolandia', 
        place_name: 'polloland', 
		google_places_id: 'anotherTestGooglePlacesId',
        location: {lat: 123, lon: 456}
	  },
      starts_at: new Date('2017-05-05T02:20:10Z'), 
      tags: ['feria', 'pollo']
    })
    .then(event => {
      createdEvent2 = event;
      assert.ok(event._id);
      assert.equal(Date(event.starts_at), Date('2017-05-05T02:20:10Z'));
      assert.equal(event.name, 'feria del pollo Z');
      assert.equal(event.description, 'una feria de pollos');
      assert.lengthOf(event.going_rides, 0);
      assert.lengthOf(event.returning_rides, 0);
      assert.equal(event.organizer._id, testUser._id);
      assert.equal(event.tags[0], 'feria');
      assert.equal(event.tags[1], 'pollo');

      return Place.findOne({_id: event.place})
        .then(place => {
          testPlace2 = place;
          assert.equal(place.address, 'pollolandia');
          assert.equal(place.location.lat, 123);
          assert.equal(place.location.lon, 456);
        });
    });
    
  });

});
