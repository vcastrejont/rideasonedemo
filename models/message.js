var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var messageSchema = new Schema({
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  content: { type: String, required: true },
  author: { type: ObjectId, ref: 'user', required: true }
});

module.exports = mongoose.model('message', messageSchema);
