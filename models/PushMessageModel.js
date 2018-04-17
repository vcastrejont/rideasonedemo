var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var Status = ["PENDING", "SENT", "ERROR"];

var PushMessageModel = new Schema({    messageId: { type: String, required: false },    fcm: {        to: String,        data: Schema.Types.Mixed    },    status: { type: String, default: "PENDING", enum: Status },    error: { type: Schema.Types.Mixed, required: false }});

module.exports = mongoose.model('PushMessageModel', PushMessageModel);
