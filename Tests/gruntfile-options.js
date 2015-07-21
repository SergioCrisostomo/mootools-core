"use strict";

var fs = require('fs');
var YAML = require('js-yaml');
var ymlPackage = YAML.safeLoad(fs.readFileSync('package.yml', 'utf8'));
var travisBuild = process.env.BUILD;
var travisBrowser = process.env.BROWSER;
var sauceBrowsers = JSON.parse(fs.readFileSync('Tests/browsers.json'));

var packagerOptions = {

    all: {
        src: ymlPackage.sources,
        dest: 'mootools-all.js'
    },
    nocompat: {
        options: {
            strip: ['.*compat'],
            only: '<%= grunt.option("file") && "Core/" + grunt.option("file") %>'
        },
        src: ymlPackage.sources,
        dest: 'mootools-nocompat.js'
    },
    specs: {
        options: {
            name: 'Specs'
        },
        src: 'Specs/<%= grunt.option("module") || "**" %>/<%= grunt.option("file") || "*" %>.js',
        dest: 'mootools-specs.js'
    },
    specsNoCompat: {
        options: {
            name: 'Specs',
            strip: ['.*compat'],
            only: '<%= grunt.option("file") && "Specs/" + grunt.option("file") %>'
        },
        src: 'Specs/**/*.js',
        dest: 'mootools-specs.js'
    }
}
exports.browsers = ['phantomjs', 'chrome_linux', 'firefox_linux', 'opera_win2000', 'safari8', 'safari7', 'safari6', 'ie11', 'ie10', 'ie9', 'ie8', 'ie7'];
exports.buildBlocks = [/*'1.2compat', '1.3compat', '1.4compat', '*compat'*/, 'IE', 'ltIE8', 'ltIE9', '!ES5', '!ES5-bind', '!ES6', 'webkit', 'ltFF4'];
exports.combinationsExclude = {
	ie11: ['!ES6', 'IE'],
	ie10: ['!ES6', 'IE'],
	ie9: ['!ES6', 'IE'],
	ie8: ['!ES6', '!ES5', '!ES5-bind', 'ltIE9', 'IE'],
	ie7: ['!ES6', '!ES5', '!ES5-bind', 'ltIE9', 'ltIE8', 'IE'],
	chrome_linux: ['!ES6'],
	firefox_linux: ['!ES6'],
	opera_win2000: ['!ES6'],
	safari8: ['!ES6'],
	safari7: ['!ES6']	
}

exports.multiplebuilds = function(block, specs, browser){
	var strip = Array.isArray(block) ? block : [block];
	var add = specs ? '-specs' : '-source';
	var dest = ['mootools-', block, add, '.js'].join(''); ;
	return {
        options: {
            strip: strip,
            only: '<%= grunt.option("file") && "Core/" + grunt.option("file") %>'
        },
        src: specs ? 'Specs/**/*.js' : ymlPackage.sources,
        dest: dest
    }
};

var gruntOptions = {
    testserver: {
        options: {
            // We use end2end task (which does not start the webserver)
            // and start the webserver as a separate process
            // to avoid https://github.com/joyent/libuv/issues/826
            port: 8000,
            hostname: '0.0.0.0',
            middleware: function(connect, options){
                return [
                function(req, resp, next){
                    // cache get requests to speed up tests on travis
                    if (req.method === 'GET'){
                        resp.setHeader('Cache-control', 'public, max-age=3600');
                    }
                    next();
                },
                connect.static(options.base)];
            }
        }
    }
}


var karmaOptions = {
    captureTimeout: 60000 * 2,
    singleRun: true,
    frameworks: ['jasmine', 'sinon'],
    files: ['Tests/Utilities/*.js', 'mootools-*.js'],
    sauceLabs: {
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY,
        testName: 'MooTools-Core. Build: ' + travisBuild + '. Browser: ' + travisBrowser
    },
    reporters: ['progress', 'saucelabs'],
    customLaunchers: sauceBrowsers,
}

var travisOptions = {
	build: travisBuild,
	browser: travisBrowser
}

exports.packager = packagerOptions;
exports.grunt = gruntOptions;
exports.karma = karmaOptions;
exports.travis = travisOptions;
