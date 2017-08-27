'use strict';

module.exports = function(grunt){
	var dir = grunt.config.get('environment.dir'),
		build = grunt.config.get('environment.build'),
		travis = grunt.config.get('environment.travis'),
		forceJSONP = false;

	if (travis.browser === 'ie7' || travis.browser === 'ie8') forceJSONP = true;

	var travisOptions = {
		files: [dir.build + '/mootools-core.js', dir.build + '/mootools-specs.js'],
		forceJSONP: forceJSONP
	};
	if (forceJSONP) travisOptions.transports = ['polling'];

	var config = {
		clean: {
			build: {src: dir.build + '/mootools-*.js'}
		},
		karma: {
			run: {
				options: {
					files: [dir.build + '/mootools-core.js', dir.build + '/mootools-specs.js']
				}
			},
			dev: {
				options: {
					files: [dir.build + '/mootools-core.js', dir.build + '/mootools-specs.js']
				},
				singleRun: false,
				captureTimeout: 0
			},
			travis: {
				options: travisOptions,
				reporters: ['progress', 'saucelabs'],
				browsers: [travis.browser]
			}
		},
		mochaTest: {
			run: {
				src: [dir.build + '/mootools-core.js', dir.build + '/mootools-specs.js']
			},
			dev: {
				options: {
					watch: true
				},
				src: [dir.build + '/mootools-core.js', dir.build + '/mootools-specs.js']
			},
			travis: {
				src: [dir.build + '/mootools-core.js', dir.build + '/mootools-specs.js']
			}
		},
		packager: {
			compat: {
				options: {
					strip: build.compat.strip,
					only: build.compat.components
				},
				src: build.compat.sources,
				dest: dir.build + '/mootools-core.js'
			},
			nocompat: {
				options: {
					strip: build.nocompat.strip,
					only: build.nocompat.components
				},
				src: build.nocompat.sources,
				dest: dir.build + '/mootools-core.js'
			},
			server: {
				options: {
					strip: build.server.strip,
					only: build.server.components
				},
				src: build.server.sources,
				dest: dir.build + '/mootools-core.js'
			}
		},
		eslint: {
			compat: {
				src: ['Gruntfile.js', 'Grunt/{options,tasks}/*.js', build.compat.sources, build.compat.specs]
			},
			nocompat: {
				src: ['Gruntfile.js', 'Grunt/{options,tasks}/*.js', build.nocompat.sources, build.nocompat.specs]
			},
			server: {
				src: ['Gruntfile.js', 'Grunt/{options,tasks}/*.js', build.server.sources, build.server.specs]
			}
		}
	};

	return config;
};
