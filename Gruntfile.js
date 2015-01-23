"use strict";
var fs = require('fs');
var http = require('http');
var build = process.argv[2] || 'all';

http.createServer(function(req, res){
	if (req.url.indexOf('flush') != -1){

		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write('<html><head><meta http-equiv="Content-Type" content="text/html;charset=UTF-8" /><title>Flushed page scenario</title><script src="' + __dirname + '/mootools-' + build + '.js" type="text/javascript"></script><script>window.moments = []; moments.push(document.readyState); function callback(){ window.callbackFired = true; moments.push(document.readyState); } window.callbackFired = false; window.addEvent("domready", callback);</script></head>');
		setTimeout(function() { 	
			res.write('<body><div>body added...</div><script>moments.push(document.readyState);</script></body>');                                                          
			setTimeout(function() { 
				res.end('</html>');
			}, 2000);                                                                      
		}, 2000);

	} else {
		fs.readFile(__dirname + '/tests/DOMReady/' + req.url, 'utf-8', function (err, content) {
			if (err) return console.log(err);
			content = content.replace('mootoolsPath', __dirname + '/mootools-' + build);
			res.end(content);
		});
	}
}).listen(9000);

module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-uglify');
	require('load-grunt-tasks')(grunt);

	var fs = require('fs');
	var usePhantom = process.env.TRAVIS_PULL_REQUEST != 'false' || process.env.BROWSER == 'phantomjs';
	var distTasks = JSON.parse(fs.readFileSync('Tests/dist-tasks.json'));
	var options = require('./Tests/gruntfile-options');

	grunt.initConfig({
		'connect': options.grunt,
		'packager': {
			options: {name: 'Core'},
			'all':options.packager.all,
			'nocompat':options.packager.nocompat,
			'specs':options.packager.specs,
			'specs-nocompat':options.packager.specsNoCompat,
			'dist-all': distTasks.build.compat,
			'dist-nocompat': distTasks.build.nocompat,
			'dist-server': distTasks.build.server
		},
		uglify: distTasks.uglify,
		'karma': {
			options: options.karma,
			continuous: {
				browsers: ['Chrome']
			},
			sauceTask: {
				browsers: [options.travis.browser]
			},
			dev: {
				singleRun: false,
				browsers: ['PhantomJS'],
				reporters: 'dots'
			},
			// Testers for dist build files
			compatFull: distTasks.testTasks.compatFull,
			compatUglyfied: distTasks.testTasks.compatUglyfied,
			nocompatFull: distTasks.testTasks.nocompatFull,
			nocompatUglified: distTasks.testTasks.nocompatUglified
		},

		'clean': {
			dist: {src: 'dist/mootools-*.js'},
			specs: {src: 'mootools-*.js'}
		}
	});

	var compatBuild = ['clean:specs', 'packager:all', 'packager:specs'];
	var nocompatBuild = ['clean:specs', 'packager:nocompat', 'packager:specs-nocompat'];
	var tasks = options.travis.build == 'default' ? compatBuild : nocompatBuild;
	tasks = usePhantom ? tasks.concat('karma:continuous') : tasks.concat('karma:sauceTask');

	grunt.registerTask('default', compatBuild.concat('karma:continuous'));		// local testing - compat build
	grunt.registerTask('nocompat', nocompatBuild.concat('karma:continuous'));	// local testing - no compat build
	grunt.registerTask('default:travis', tasks);								// Travis & Sauce Labs
	grunt.registerTask('distBuild', [											// task to build and test /dist files
		// Build dist files
		'clean:dist', 'packager:dist-all', 'packager:dist-nocompat', 'packager:dist-server', 'uglify',
		// Test specs against dist files
		'clean:specs', 'packager:specs', 'karma:compatFull', 'karma:compatUglyfied',
		'clean:specs', 'packager:specs-nocompat', 'karma:nocompatFull', 'karma:nocompatUglified'
	]);

};
