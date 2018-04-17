var express = require('express');
var router = express.Router();
var mailerController = require('../controllers/mailerController.js');

// function isLoggedIn(req, res, next) {
// 	if (req.isAuthenticated())
// 		return next();
// 	res.redirect('/login');
// }
  
router.get('/', function(req, res) {
	// if (req.isAuthenticated()){
		res.render('app.ejs');
	// }else{
	// 	res.render('landing.ejs');
	// }
});
// 
// 
// //router.post('/', mailerController.contact);  
// 
// router.get('/app',  function(req, res, next) {
// 	res.render('app.ejs');
// });
// 
// router.get('/login',  function(req, res) {
// 		res.render('login.ejs');
// });
// router.get('/logout', function(req, res) {
//   req.logout();
//   res.redirect('/');
// });

module.exports = router;
