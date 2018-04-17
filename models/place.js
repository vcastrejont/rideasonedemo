var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var PlaceSchema = new Schema({
  name: String,
  google_places_id: String,
  address: String,
  location: {
    lat: {type: Number, required: true},
    lon: {type: Number, required: true},
  },
  created_at: {type: Date, default: Date.now},
  updated_at: {type: Date, default: Date.now}
});

var Place = mongoose.model('place', PlaceSchema);

module.exports = Place;
