var assert = require('chai').assert;
var util = require('../util');
var User = require('../../models/User');
var _ = require('lodash');
var testUser;

describe('Updating User FCM tokens', function(){
  before(() => {
    return new User({
      name:'test', 
      email:'test@test.com', 
      provider_id: Date.now()
    })
    .save()
    .then((user) => {
      testUser = user;
    })
  });

  after(() => {
    return testUser.remove()
  });

  it('only adds a token if is first to be added', () => {
    return testUser.updateFcmToken({old: 'oldToken', active: 'newActiveToken'})
    .then(user => {
      assert.sameMembers(user.fcm_tokens, ['newActiveToken']);
    });
  });

  it("only adds a token if old doesn't exist", () => {
    return testUser.updateFcmToken({old: 'oldToken', active: 'newerActiveToken'})
    .then(user => {
      assert.sameMembers(user.fcm_tokens, ['newActiveToken', 'newerActiveToken']);
    });
  });

  it('replaces an old token by a new one', () => {
    return testUser.updateFcmToken({old: 'newActiveToken', active: 'newestActiveToken'})
    .then(user => {
      assert.sameMembers(user.fcm_tokens, ['newestActiveToken', 'newerActiveToken']);
    });
  });

});
