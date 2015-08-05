"use strict";

module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-uglify');
	require('load-grunt-tasks')(grunt);

	var fs = require('fs');
	var usePhantom = process.env.TRAVIS_PULL_REQUEST != 'false' || process.env.BROWSER == 'phantomjs';
	var distTasks = JSON.parse(fs.readFileSync('Tests/dist-tasks.json'));
	var options = require('./Tests/gruntfile-options');

	var gruntConfigObject = {
		'saucelabs-jasmine': {
			all: {
				options: {
					urls: ['www.example.com/qunitTests', 'www.example.com/mochaTests'],
					build: process.env.CI_BUILD_NUMBER,
					testname: 'Sauce Unit Test for example.com',
					browsers: [["XP", "firefox", 19], ["XP", "chrome", 31]],
					onTestComplete: function (result, callback) {
						// Called after a unit test is done, per page, per browser
						// 'result' param is the object returned by the test framework's reporter
						// 'callback' is a Node.js style callback function. You must invoke it after you
						// finish your work.
						// Pass a non-null value as the callback's first parameter if you want to throw an
						// exception. If your function is synchronous you can also throw exceptions
						// directly.
						// Passing true or false as the callback's second parameter passes or fails the
						// test. Passing undefined does not alter the test result. Please note that this
						// only affects the grunt task's result. You have to explicitly update the Sauce
						// Labs job's status via its REST API, if you want so.
						console.log(result, '**++++++++++++++++++++++**');
						callback(true);
					}
				}
			}
		},
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
				browsers: ['PhantomJS']
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
	}

	var taskSequence = [];
	var karma = usePhantom ? 'karma:continuous' : 'karma:sauceTask';
	options.buildBlocks.filter(function(block){
		console.log('debug log', process.env.BROWSER || 'phantomjs', options.combinationsExclude[process.env.BROWSER || 'phantomjs']);
		var blocksToNotTest = options.combinationsExclude[process.env.BROWSER || 'phantomjs'];
		return blocksToNotTest.indexOf(block) == -1;
	}).forEach(function(block){
		// no compat
		gruntConfigObject.packager[block + '-nocompat'] = options.multiplebuilds([block, '*compat'], false);
		gruntConfigObject.packager[block + '-specs' + '-nocompat'] = options.multiplebuilds([block, '*compat'], 'specs');
		taskSequence = taskSequence.concat(['clean:specs', 'packager:' + block + '-nocompat', 'packager:' + block + '-specs' + '-nocompat', karma]);
		// compat
		gruntConfigObject.packager[block] = options.multiplebuilds(block, false);
		gruntConfigObject.packager[block + '-specs'] = options.multiplebuilds(block, 'specs');
		taskSequence = taskSequence.concat(['clean:specs', 'packager:' + block, 'packager:' + block + '-specs', karma]);
	})

	grunt.initConfig(gruntConfigObject);
	grunt.registerTask('default:travis', function(){
		grunt.task.run('saucelabs-jasmine');
	});

	grunt.registerTask('distBuild', [											// task to build and test /dist files
		// Build dist files
		'clean:dist', 'packager:dist-all', 'packager:dist-nocompat', 'packager:dist-server', 'uglify',
		// Test specs against dist files
		'clean:specs', 'packager:specs', 'karma:compatFull', 'karma:compatUglyfied',
		'clean:specs', 'packager:specs-nocompat', 'karma:nocompatFull', 'karma:nocompatUglified'
	]);

};
