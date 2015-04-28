/*
 * grunt-appstorm
 * https://github.com/Deisss/appstorm-grunt
 *
 * Copyright (c) 2015 Deisss
 * Licensed under the MIT license.
 */


var types = ['css', 'js', 'html', 'translate'];


module.exports = {
    /**
     * The supported types.
     *
     * @property types
    */
    types: types,

    /**
     * Sort and remove duplicates from an array of path parsed
     *
     * @param {Array} a                     The array to parse
     * @return {Array}                      The array parsed
    */
    uniqPathSorter: function (a) {
        return a.sort().filter(function(item, pos, ary) {
            return !pos || item.norm != ary[pos - 1].norm;
        })
    },

    /**
     * Read file and create the file rendering system.
     *
     * @private
     *
     * @param {Object} grunt                The grunt task
     * @param {String} type                 The type of file (css, js, ...)
     * @param {String} src                  The file source
     * @param {String} norm                 The normalized file source
     * @return {String}                     The readed file encaps into
     *                                      a script tag.
    */
    compact: function (grunt, type, src, norm) {
        var content = '<!-- FILE ' + src + ' -->\n' +
                '<script type="appstorm/' + type.toLowerCase() +
                '" data-src="' + norm.replace(/\\/g, '/') + '">\n';
        content += grunt.file.read(src);
        content += '\n</script>\n\n';
        return content;
    },

    /**
     * Convert any single values/object into an array, then, the system always
     * return an array.
     *
     * @param {Object} el                   The element to search inside,
     * @param {String} name                 The property we want to have
     *                                      corresponding array from
     * @return {Array}                      An array of strings, can be
     *                                      empty
    */
    valueToArray: function (el, name) {
        if (name in el) {
            var type = typeof el[name];
            // It's an array
            if (Object.prototype.toString.call(el[name]) ===
                    '[object Array]') {
                return el[name];

            // It's an object (probably partials goes here...)
            } else if (type === 'object' && type !== 'undefined' &&
                    el[name] !== null) {

                var results = [];

                for (var i in el[name]) {
                    if (el[name].hasOwnProperty(i)) {
                        results.push(el[name][i]);
                    }
                }

                return results;

            // It's probably a string
            } else {
                return [el[name]];
            }
        }
        return [];
    },

    /**
     * Get parsed object results. The list of includes to manage.
     *
     * @param {Object} value                The value to parse
     * @return {Object}                     An object with data inside
    */
    parseResult: function (value) {
        var results = {},
            type    = null,
            name    = null,
            content = null,
            j       = 0,
            l       = types.length;

        // Init array
        for (; j < l; ++j) {
            results[types[j]] = [];
        }

        var obj = JSON.parse(value);

        for (var i in obj) {
            if(obj.hasOwnProperty(i) && 'include' in obj[i]) {
                for (name in obj[i]['include']) {
                    content = this.valueToArray(obj[i]['include'], name);

                    // The case to handle separately
                    if (name.indexOf('partials') === 0) {
                        name = 'html';
                    }

                    for (j = 0; j < l; ++j) {
                        type = types[j];
                        if (name.indexOf(type) === 0) {
                            results[type] = results[type].concat(content);
                        }
                    }
                }
            }
        }

        return results;
    },

    /**
     * Send a command to a browser.
     *
     * @param {String} type                 The browser, like "chrome" or
     *                                      "phantomjs"...
     * @param {String} path                 Not always used, the browser path
     * @param {Integer} port                Not always used, the browser port
     * @param {String} url                  The url to access
     * @param {String} cmd                  The command (in string) to send
     * @param {Object} scope                Not always used, the command scope
     * @param {Function} callback           The callback to apply after
    */
    browserCommand: function (type, path, port, url, cmd, scope, callback) {
        var browser = require('./browser.js')[type],
            self    = this;

        // Starting browser
        browser.start(path, port, function (path, port) {
            // Sending command to it
            browser.command(url, cmd, scope, function (error, response) {
                if (!error) {
                    callback(error, self.parseResult(response));
                } else {
                    callback(error, null);
                }

                // Stopping browser
                browser.stop();
            });
        });
    }
 }