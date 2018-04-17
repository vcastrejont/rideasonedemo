var supertest = require('supertest-as-promised');
var port = process.env.PORT|| 3000;
var req = supertest('http://localhost:'+ port +'/api');
var assert = require('chai').assert;
var sinon = require('sinon');
var util = require('../util');
var User = require('../../models/User');
var Ride = require('../../models/Ride');
var RideRequest = require('../../models/RideRequest');
var Place = require('../../models/Place');
var token1, token2, testUser1, testUser2, testRide, testRideRequest, testPlace;

describe('Ride subscription management', function(){
  before(() => {
    return new User({
      name:'driver', 
      email:'test@test.com', 
      provider_id: Date.now()
    })
    .save()
    .then(user => { 
      testUser1 = user;
      return util.getTokenForUser(user._id);
    })
    .then(token => {
      token1 = token;
      return new User({
        name: 'passenger',
        email: 'passenger@test.com',
        provider_id: Date.now()
      })
      .save();
    })
    .then(user => {
      testUser2 = user; 
      return util.getTokenForUser(user._id);
    })
    .then(token => {
      token2 = token;
      return new Place({
        google_places_id: 'asdfasdf',
        address: 'aaaaaaaaaaaa',
        location: {lat: 5, lon: 8}
      })
    })
    .then(place => {
      testPlace = place;
      return new Ride({
        seats: 4,
        comment: 'join me',
        driver: testUser1._id,
        place: testPlace._id
      })
      .save();
    })
    .then(ride => {
      testRide = ride;
    });
  });

  after(() => {
    return testUser1.remove()
    .then(() => testUser2.remove())
    .then(() => testRide.remove())
    .then(() => testRideRequest.remove());
  });

  it('creates a ride request', () => {
    return testUser2.requestJoiningRide(testRide._id, testPlace)
    .then(request => {
      testRideRequest = request;
      assert.equal(request.passenger._id, testUser2._id);
    });
  });

  it('accepts a passenger into a ride', () => {
    return req.put('/rides/'+ testRide._id +'/ride-requests/'+ testRideRequest._id +'/accept')
    .set('Authorization', token1)
    .expect(200)
    .then(res => RideRequest.find({_id: testRideRequest._id}))
    .then(request => {
      assert.lengthOf(request, 0);
      return Ride.findOne({_id: testRide._id});
    })
    .then(ride => {
      assert.equal(ride.passengers[0].user.toString(), testUser2._id.toString());
    });
  })

  it('cancels an accepted ride by passenger', () => {
    return req.put('/rides/'+ testRide._id +'/leave')
    .set('Authorization', token2)
    .expect(200)
    .then(res => Ride.findOne({_id: testRide._id}))
    .then(ride => {
      assert.lengthOf(ride.passengers, 0);
    });
  });

});
