// Chatroom
module.exports = function(server) {

  var io = require('socket.io')(server);
  var users = [];

  io.on('connection', function (socket) {
    var addedUser = false;
    var rideId;

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (data) {
      var exists,
      i;

      addedUser = true;
      rideId = data.rideId;

      // we store the username in the socket session for this client
      socket.user = data.user;

      for(i = 0; i < users.length; i++) {
        if(users[i].id === socket.user.id) {
          exists = true;
        }
      }

      if(!exists) {
        users.push(socket.user);

        // echo globally (all clients) that a person has connected
        socket.broadcast.to(rideId).emit('user joined', {
          username: socket.user.name,
          users: users
        });
      }

      socket.emit('login', users);

      // join the conversation
      socket.join(rideId);
    });

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (message) {

      socket.broadcast.to(rideId).emit('new message', {
        username: socket.user.name,
        message: message
      });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {

      socket.broadcast.to(rideId).emit('typing', {
        username: socket.user.name
      });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {

      socket.broadcast.to(rideId).emit('stop typing', {
        username: socket.user.name
      });
    });

    // when the client emits 'add passenger', this listens and executes
    socket.on('share location', function (data) {
      var exists,
      i;

      if(!addedUser) {
        addedUser = true;
      }
      
      rideId = data.rideId;
      // join the conversation
      socket.join(rideId);
      // we store the username in the socket session for this client
      socket.user = data.user;

      for(i = 0; i < users.length; i++) {
        if(users[i].id === socket.user.id) {
          exists = true;
          users[i] = socket.user;
        }
      }

      if(!exists) {
        users.push(socket.user);
      }

      // echo globally (all clients) that a person has connected
      io.sockets.in(rideId).emit('location updated', users);
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
      if (addedUser) {
        users.splice(users.indexOf(socket.user), 1);

        // echo globally that this client has left
        socket.broadcast.to(rideId).emit('user left', {
          username: socket.user.name,
          users: users
        });
      }
    });
  });
}
