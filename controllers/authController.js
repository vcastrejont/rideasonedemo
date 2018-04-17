var passport = require('passport');
var jwt = require('jsonwebtoken');
var config = require('../config/config');
var error = require('../lib/error');

module.exports = {
  PostGoogleAuth: function (req, res, next) {
    passport.authenticate('google-id-token', function (err, user, info) {
      if (err) return next(error.http(401, err.message));
      var token = jwt.sign({ id: user.id }, config.jwtSecret, {
        expiresIn: '36500 days', // 100 years
        issuer: config.issuer
      });
      return res.json({ token: token });
    })(req, res, next);
  },

  GetProfile: function (req, res) {
    if(!req.user) next(error.http(400, 'JWT token or user no longer exists'));
    res.json(req.user.profile);
  },

  FakeAuthForTesting: function (req, res, next) {
    var token = jwt.sign({id: req.body.userId}, config.jwtSecret, {
      expiresIn: '36500 days', // 100 years
      issuer: config.issuer
    });
    return res.json({ token: token });
  }
  
};

