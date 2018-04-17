'use strict';

var config = require('../config/config');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var path = require('path');
var templatesDir = path.resolve(__dirname, '..', 'views/mailer');
var EmailTemplate = require('email-templates').EmailTemplate;
var Promise = require('bluebird');
var _ = require('underscore');

var defaultTransport = nodemailer.createTransport(smtpTransport(config.mailer.transportUrl));

exports.send = function (templateName, data) {

  function promise(resolve, reject) {
    var to = data.to;

    if (process.env.NODE_ENV === 'test') 
      return fn(null, '250 2.0.0 OK 1350452502 s5sm19782310obo.10', html, text);
    if (!to) reject(new Error('No recipient info provided'));
    if (!data.subject) reject(new Error('No mail subject provided'));
    
    var template = new EmailTemplate(templatesDir +'/'+ templateName);

    if(Array.isArray(to)){
      var mails = to.map(receiver => {
        if(!to.address) return console.log('missing address'); 
        var data = _.clone(data);
        data.to = receiver;
        return template.render(receiver.locals)
          .then(mail => sendMail(mail, data));
      }); 

      return Promise.all(mails)
        .then(resolve)
    }
    else {
      if(!to.address) reject(new Error('No recipient address provided'))
      return template.render(to.locals)
        .then(mail => sendMail(mail, data))
        .then(resolve)
    } 
  }
  return new Promise(promise);
}

function sendMail(mail, locals) {
  var transport = defaultTransport;
  var data = {
    from: config.mailer.from,
    to: locals.to.address,
    subject: locals.subject,
    html: mail.html,
    // generateTextFromHTML: true,
    text: mail.text
  };
  return transport.sendMail(data);
};

