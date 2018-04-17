var firebase = require("firebase");
var config = require("../config/config");

var app = firebase.initializeApp(config.firebase);

var fdb = firebase.database();

module.exports = fdb;

