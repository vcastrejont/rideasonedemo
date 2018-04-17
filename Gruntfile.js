var path = require("path");
var glob = require("glob");
var _ = require("lodash");

var CLIENT_JS_PATH = path.resolve( __dirname, "./public/app/" );

var _clientJsCache;

module.exports = function( grunt ) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clientJs: _clientJSFiles(),
		concat: {
			js: {
				src: '<%= clientJs %>',
				dest: './public/rideasone.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.registerTask('default', ['compile-js']);
	grunt.registerTask('compile-js', ['concat']);
};

function _moveAppJsToTop( files ){
	var appjs = _.remove( files, function( file ){
		return file === "app.js";
	});

	_.each( appjs, function( file ){
		files.unshift( file );
	});

	return files;
}

function _clientJSFiles(){
	if( _clientJsCache ) return _clientJsCache;

	var options = {
		cwd: CLIENT_JS_PATH
	};

	_clientJsCache = glob.sync( "**/*.js", options );

	_moveAppJsToTop( _clientJsCache );

	_clientJsCache = _.map(_clientJsCache, function(file) {
		return CLIENT_JS_PATH + "/" + file;
	});

	return _clientJsCache;
};
