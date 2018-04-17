var settingModel = require('../models/settingModel.js');

module.exports = {

    show: function(req, res) {
      settingModel.findOne(function(err, setting){
          if(err) {
              return res.json(500, {
                  message: 'Error getting settings.'
              });
          }
            return res.json(setting);
        });
    },

    update: function(req, res) {
      return res.json(500, {
          message: 'Error getting settings.'
      });
    },


};
