var User = require('../models/user.js');
var GoogleTokenStrategy = require('passport-google-id-token');
var passportJwt = require('passport-jwt');
var JwtStrategy = passportJwt.Strategy;
var ExtractJwt = passportJwt.ExtractJwt;

var config = require('../config/config');

module.exports = function (passport) {
  passport.use(new GoogleTokenStrategy({
    clientID: config.google.key
  }, function (parsedToken, googleId, done) {
    var profile = parsedToken.payload;
    User.findOne({ provider_id: googleId })
      .then((user) => {
        if (user) return done(null, user);
        var newUser = new User({
          provider_id: googleId,
          provider: 'google',
          name: profile.name,
          photo: profile.picture,
          email: profile.email
        });
        return newUser.save();
      })
      .then(user => done(null, user))
      .catch(err => done(err));
  }));

  passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    secretOrKey: config.jwtSecret,
    issuer: config.issuer
  }, function (payload, done) {
    return User.findById(payload.id)
      .then((user) => {
        if (!user) return done(new Error('User not found'));
        return done(null, user);
      })
      .catch(err => done(err));
  }));
};
