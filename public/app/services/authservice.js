angular
.module('carPoolingApp')
.service('authservice', authservice);

authservice.$inject = ['$http'];

function authservice($http) {
  return {
    login: function(id_token) {
      return $http.post('/auth/google',  { id_token: id_token } );  
    },
    
  };
}
