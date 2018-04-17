angular
.module('carPoolingApp')
.service('sessionservice', sessionservice);

authservice.$inject = ['$http','$localStorage'];

function sessionservice($http, $localStorage) {
  return {
    set: function(token) {
      return $http.get('/auth/me', {headers: {'Authorization': 'JWT '+ token}}).then(function(user){
        console.log("------user----------");
        console.log(user.data);
        $localStorage.name = user.data.name;
        $localStorage.email = user.data.email;
        $localStorage.photo = user.data.photo;
        $localStorage.id = user.data._id;
        $localStorage.token =token;
        return user.data;
      });  
    },
    check:function() {
      if($localStorage.token){
        return true
      }else{
        return false
      }
    },
    token:function() {
      return $localStorage.token;
    },
    clear:function(){
      $localStorage.$reset();
    },
    user:function(){
      return {
        name: $localStorage.name,
        photo: $localStorage.photo,
        email: $localStorage.email,
        id: $localStorage.id
      }
    }
  };
}
