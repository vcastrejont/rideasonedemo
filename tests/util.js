var supertest = require('supertest-as-promised');
var port = process.env.PORT|| 3000;

module.exports.getTokenForUser = function (userId) {
  return supertest('http://localhost:'+ port)
    .post('/auth/fakeAuthForTesting')
    .send({userId: userId})
    .then(res => {
      return 'JWT '+ res.body.token;
    });
}
