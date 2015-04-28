/*
 * grunt-appstorm
 * https://github.com/Deisss/appstorm-grunt
 *
 * Copyright (c) 2015 Deisss
 * Licensed under the MIT license.
 */

'use strict';

var helper = require('./helper.js'),
    wait = require('./wait.js'),
    path = require('path');

/**
 * Wrote down the final file containing all concatenated data.
 *
 * @param {Object} grunt                    The grunt task
 * @param {Array} types                     The list of supported types
 *                                          (js, css, html, ...)
 * @param {Object} content                  The list of files to append
 * @param {String} dest                     The final destination file
*/
function release(grunt, types, content, dest) {
    var type = null,
        result = '';

    // First we make path absolute, so we can can't more easily
    // duplicate

    for (var i = 0, l = types.length; i < l; ++i) {
        type = types[i];

        // Make all path normalized, so we can more easily remove duplicate
        for (var j = 0, k = content[type].length; j < k; ++j) {
            content[type][j] = {
                file: content[type][j],
                norm: path.normalize(content[type][j])
            };
        }

        // Remove duplicates
        content[type] = helper.uniqPathSorter(content[type]);

        // Get content and append it to final string
        for (var j = 0, k = content[type].length; j < k; ++j) {
            result += helper.compact(grunt, type,
                content[type][j].file, content[type][j].norm);
        }
    }

    // Building element
    grunt.file.write(dest, result);

    // Print a success message.
    grunt.log.writeln('File "' + dest + '" created.');
}

/**
 * AppStorm.JS grunt concat helper.
 *
 * @param {Object} grunt                    The grunt task
 * @param {Array} src                       The source files to use for dest
 * @param {String} dest                     The destination filename
 * @param {Object} options                  The task options
*/
function appstorm(grunt, src, dest, options, done) {
    // Keep only existing files.
    var files = src.filter(function(path) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(path)) {
            grunt.log.warn('Source file "' + path + '" not found.');
            return false;
        } else {
            return true;
        }
    });

    // Store temporary result data
    var content = {},
        self    = this,
        type    = null,
        types   = helper.types,
        i       = 0,
        l       = 0,
        j       = 0,
        k       = 0;

    var end = function() {
        release.call(self, grunt, types, content, dest);
        done();
    };

    var waiting = new wait(end);

    // Creating content array
    for (i = 0, l = types.length; i < l; ++i) {
        content[types[i]] = [];
    }

    // For every file, we load in phantomjs, and try to get
    // AppStorm.JS states, to find files to preload
    for (j = 0, k = files.length; j < k; ++j) {
        waiting.lock();
        helper.browserCommand(options.engine, options.path,
                options.port, options.base + files[j],
                'a.parser.json.stringify(a.state.tree())', 'console',
                function (error, data) {
                    for (i = 0; i < l; ++i) {
                        type = types[i];
                        content[type] = content[type].concat(data[type]);
                    }

                    waiting.release();
                });
    }
}

module.exports = function(grunt) {
    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('appstorm', 'AppStorm.JS compacter', function() {
        var done = this.async();

        // Merge task-specific and/or target-specific options with these
        // defaults.
        var options = this.options({
            engine: 'phantomjs',
            path: null,
            port: null,
            base: 'http://localhost/'
        });

        var origSrc  = ['index.html'],
            origDest = '_appstorm.html';

        // Direct call
        if (this.src || this.dest) {
            appstorm.call(this, grunt, this.src || origSrc,
                    this.dest || origDest, options, done);

        // Not direct call
        } else {
            for (var i in this) {
                if (this.hasOwnProperty(i) && i !== 'options' &&
                        (this[i].src || this[i].dest)) {
                    appstorm.call(this, grunt, this[i].src || origSrc,
                            this[i].dest || origDest, options, done);
                }
            }
        }
    });
};
