"use strict";

module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-uglify');
	require('load-grunt-tasks')(grunt);

	var fs = require('fs');
	var usePhantom = process.env.TRAVIS_PULL_REQUEST != 'false' || process.env.BROWSER == 'phantomjs';
	var distTasks = JSON.parse(fs.readFileSync('Tests/dist-tasks.json'));
	var options = require('./Tests/gruntfile-options');

	var gruntConfigObject = {
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
	options.buildBlocks.filter(function(block){
		var blocksToNotTest = options.combinationsExclude[process.env.BROWSER];
		return blocksToNotTest.indexOf(block) == -1;
	}).forEach(function(block){
		// no compat
		gruntConfigObject.packager[block] = options.multiplebuilds([block, '*compat'], false);
		gruntConfigObject.packager[block + '-specs'] = options.multiplebuilds([block, '*compat'], 'specs');
		taskSequence = taskSequence.concat(['clean:specs', 'packager:' + block + '-nocompat', 'packager:' + block + '-specs' + '-nocompat', karma]);
		// compat
		gruntConfigObject.packager[block] = options.multiplebuilds(block, false);
		gruntConfigObject.packager[block + '-specs'] = options.multiplebuilds(block, 'specs');
		taskSequence = taskSequence.concat(['clean:specs', 'packager:' + block, 'packager:' + block + '-specs', karma]);
	})

	grunt.initConfig(gruntConfigObject);
	grunt.registerTask('default', compatBuild.concat('karma:continuous'));		// local testing - compat build
	grunt.registerTask('nocompat', nocompatBuild.concat('karma:continuous'));	// local testing - no compat build
	grunt.registerTask('default:travis', function(){							// Travis & Sauce Labs+
		grunt.task.run(taskSequence);
	});

	grunt.registerTask('distBuild', [											// task to build and test /dist files
		// Build dist files
		'clean:dist', 'packager:dist-all', 'packager:dist-nocompat', 'packager:dist-server', 'uglify',
		// Test specs against dist files
		'clean:specs', 'packager:specs', 'karma:compatFull', 'karma:compatUglyfied',
		'clean:specs', 'packager:specs-nocompat', 'karma:nocompatFull', 'karma:nocompatUglified'
	]);

};
