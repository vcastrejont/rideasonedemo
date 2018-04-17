/**
 * mailerController.js
 *
 * @description :: Server-side logic for sending emails.
 */
 var nodemailer = require('nodemailer');
 var config = require('../config/config.js');
 var transporter = nodemailer.createTransport( {
     service:  config.mailer.service,
     auth: {
      user: config.mailer.user,
      pass: config.mailer.pass
     }
 });
module.exports = {
    /**
     * mailerController.joinCar()
     */
    joinCar: function(user_name, event_name, driver_email) {
      var html_text = 'Hello, <br> <p>This message is to inform you that have a new passenger in your car for the event: <b>'+ event_name +'</b></p>';
      html_text +='<p>You new passenger name is: <b> ' + user_name+'</b></p>';
      html_text +='<p>The carpooling app</p>';
      var mailOpts = {
          from: config.mailer.from,
          to: driver_email,
          subject: 'You have a new passanger',
          text : 'You have a new passanger',
          html : html_text
      };
      transporter.sendMail(mailOpts, function (err, response) {
          if (err) {
           console.log(err);
          } else {
           console.log("Mail send to: " +mailOpts.to);
          }
      });
    },
    
    messageDriver: function(data, callback) {
        var html_text = 'Hello, <br> <p>' + data.user_email + ' sent you a message:</p>' +
            '<p>' + data.content + '</p>' +
            '<br><p>The carpooling app</p>';

        var mailOpts = {
            from: config.mailer.from,
            to: data.driver_email,
            subject: data.user_email + ' sent you a message',
            text : 'Hello, ' + data.user_email + ' sent you a message: ' + data.content + ". The carpooling app.",
            html : html_text
        };
        transporter.sendMail(mailOpts, callback);

    },

    leaveCar: function(user_name, event_name, driver_email) {
      var html_text = 'Hello, <br> <p>This message is to inform you that <b>'+ user_name+'</b> has left your car for the event: <b>'+ event_name +'</b></p>';
      html_text +='<p>The carpooling app</p>';

      var mailOpts = {
          from: config.mailer.from,
          to: driver_email,
          subject: 'A passanger has left your car',
          text : 'A passanger has left your car',
          html : html_text
      };
      transporter.sendMail(mailOpts, function (err, response) {
          if (err) {
           console.log(err);
          } else {
           console.log("Mail send to: " +mailOpts.to);
          }
      });
    },
    
    contact:  function(req, res) {
      console.log(req.body);
      var html_text = 'Hello, <br> <p>We have recived a contact form: </p>'+'<p><strong>Name:</strong>'+req.body.name+'<br>'+'<strong>Email:</strong>'+req.body.email+'<br>'+'<strong>Company:</strong>'+req.body.company+'<br>'+  '<strong>City:</strong>'+req.body.city+'</p>';
      html_text +='<br><p>The carpooling app</p>';
      
      var mailOpts = {
          from: config.mailer.from,
          to: config.mailer.default,
          subject: 'New contact form',
          text : 'New contact form',
          html : html_text
      };
      transporter.sendMail(mailOpts, function (err, response) {
          if (err) {
            return res.status(500).send({ error: err });
             //return res.status(500).json(message: err);
           console.log(err);
          } else {
            console.log("Mail send to: " +mailOpts.to);
            return res.status(200).send({ message:'Email sent' });
            //return res.status(200).json(message: 'Email sent');
          }
      });

    }  
};
