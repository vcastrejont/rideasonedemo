var locationModel = require('../models/locationModel.js');

/**
 * locationController.js
 *
 * @description :: Server-side logic for managing locations.
 */
module.exports = {

    /**
     * locationController.list()
     */
    list: function(req, res) {
        locationModel.find(function(err, locations){
            if(err) {
                return res.json(500, {
                    message: 'Error getting location.'
                });
            }
            return res.json(locations);
        });
    },

    /**
     * locationController.show()
     */
    show: function(req, res) {
        var id = req.params.id;
        locationModel.findOne({_id: id}, function(err, location){
            if(err) {
                return res.json(500, {
                    message: 'Error getting location.'
                });
            }
            if(!location) {
                return res.json(404, {
                    message: 'No such location'
                });
            }
            return res.json(location);
        });
    },

    /**
     * locationController.create()
     */
    create: function(req, res) {
      var newLocation = new locationModel({		       name : req.body.name,
           location : req.body.location,
           place_id : req.body.place_id,
           address : req.body.address
      });
      locationModel.findOne({place_id: req.body.place_id}, function(err, location){
          if(err) {
              return res.json(500, {
                  message: 'Error getting location.'
              });
          }
          if(!location) {
            newLocation.save(function(err, location){
                if(err) {
                    return res.json(500, {
                        message: 'Error saving location',
                        error: err
                    });
                }
              
                return res.status(200).json(location);
            });
          }
      
          return res.status(200).json(location);
      });
    },

    /**
     * locationController.update()
     */
    update: function(req, res) {
        var id = req.params.id;
        locationModel.findOne({_id: id}, function(err, location){
            if(err) {
                return res.json(500, {
                    message: 'Error saving location',
                    error: err
                });
            }
            if(!location) {
                return res.json(404, {
                    message: 'No such location'
                });
            }

            location.name =  req.body.name ? req.body.name : location.name;			
            location.save(function(err, location){
                if(err) {
                    return res.json(500, {
                        message: 'Error getting location.'
                    });
                }
                if(!location) {
                    return res.json(404, {
                        message: 'No such location'
                    });
                }
                return res.json(location);
            });
        });
    },
    /**
     * locationController.remove()
     */
    remove: function(req, res) {
        var id = req.params.id;
        locationModel.findByIdAndRemove(id, function(err, location){
            if(err) {
                return res.json(500, {
                    message: 'Error getting location.'
                });
            }
            return res.json(location);
        });
    }
};
