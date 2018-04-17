angular.module('apiservice', [])
.factory('apiservice', ['$http', apiservice]);

function apiservice($http) {
	var service = {};

	service.getUserRides = function(user_id) {
		return $http.get('/api/users/'+user_id+'/rides');
	};
	
	
	service.getEvent = function(eventId) {
		return $http.get('/api/events/' + eventId);
	};

	service.getEvents = function() {
		return $http.get('/api/events');
	};

	service.deleteEvent = function(eventId) {
		return $http.delete('/api/events/' + eventId);
	};

	service.getPastEvents = function() {
		return $http.get('/api/events/past');
	};

	service.createEvent = function(eventData) {
		return $http.post("/api/events", eventData);
	};

	service.signupToEvent = function(eventId) {
		return $http.put('/api/events/signup/' + eventId);
	};

	service.addCarToEvent = function(eventId, carData) {
		return $http.post('/api/events/'+eventId+'/ride', carData);
	};

	service.deleteCarFromEvent = function(carData) {
		// This should be a delete
		// DELETE /api/events/:eventId/car/:carId
		return $http.post('/api/events/deletecar', carData);
	};

	service.joinCar = function(ride_id, userData) {
		return $http.put('/api/rides/'+ride_id+'/join', userData);
	};
	
	service.getNotifications = function(userid) {
		return $http.get('/api/user/notifications');
	};
	
	service.readNotification = function(notification_id) {
		//"/user/notifications/:notification_id/read"
		return $http.put('/api/user/notifications/'+notification_id+'/read');
	};
	
	service.getRequest = function(request_id) {
		return $http.get('/api/ride-requests/'+request_id);
	};


	service.acceptRide = function(ride_id, request_id) {
		// /rides/:ride_id/ride-requests/:request_id/accept
		return $http.put('/api/rides/'+ride_id+'/ride-requests/'+request_id+'/accept');
	};
	
	service.rejectRide = function(ride_id) {
		return $http.put('/api/users/'+ride_id+'/reject');
	};
	
	
	service.leaveCar = function(carData) {
		return $http.post('/api/events/leavecar', carData);
	};

	service.addExtraCar = function(carData) {
		return $http.post('/api/events/addExtra', carData);
	};

	service.getSettings = function() {
		return $http.get('/api/settings');
	};

	service.saveSettings = function(settings) {
		return $http.post('/api/settings', settings);
	};

	service.sendMessage = function(options) {
		return $http.post('/api/events/' + options.eventId + '/car/' + options.carId + '/message', { message: options.message });
	};

	return service;
}
