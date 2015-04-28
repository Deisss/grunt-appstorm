/*
 * grunt-appstorm
 * https://github.com/Deisss/appstorm-grunt
 *
 * Copyright (c) 2015 Deisss
 * Licensed under the MIT license.
 */
var isWin = /^win/.test(process.platform);

var chromeInstance   = null,
    phantomeInstance = null;

module.exports = {
    /**
     * Manage chrome browser. Spawning it's process, then using remote.
    */
    chrome: {
        /**
         * Start Chrome/Chromium browser with remote debugging support.
         *
         * @param {String} path             The Chrome path
         * @param {Integer} port            The Chrome remote debugging port
        */
        start: function(path, port, callback) {
            var spawn = require('child_process').spawn,
                _path = path,
                _port = port || 9222;

            // Replace by default launch, depending on OS
            if (!_path) {
                if (isWin) {
                    _path = process.env.LOCALAPPDATA +
                            '\\Chromium\\Application\\chrome.exe';
                } else {
                    _path = 'chromium-browser';
                }
            }

            // Starting Chrome or Chromium browser with some lower security
            // issue, mostly helping in localhost/file access problem.
            chromeInstance = spawn(_path, ['--remote-debugging-port=' + _port,
                    '--disable-web-security', '-–allow-file-access-from-files'
                    ]);
            callback(_path, _port);
        },

        /**
         * Send a command to an existing Chrome/Chromium instance.
         *
         * @param {String} url              The url to call
         * @param {String} cmd              The command to send
         * @param {Object} scope            The command scope
         * @param {Function} callback       The callback to call when response
         *                                  arrives
        */
        command: function(url, cmd, scope, callback) {
            var Chrome = require('chrome-remote-interface', {
                host: 'localhost',
                port: 9222
            });

            Chrome(function (chrome) {
                with (chrome) {
                    Page.loadEventFired(function() {
                        Runtime.evaluate({
                            'expression': cmd,
                            //'objectGroup': 'console',
                            'objectGroup': scope,
                            'includeCommandLineAPI': true,
                            'doNotPauseOnExceptions': false,
                            'returnByValue': false
                        }, function (error, response) {
                            callback(error, response.result.value);
                        });
                    });
                    Network.enable();
                    Page.enable();
                    once('ready', function () {
                        Page.navigate({
                            'url': url
                        });
                    });
                }
            }).on('error', function() {
                console.error('Cannot connect to Chrome/Chromium');
            });
        },

        /**
         * Stop Chrome/Chromium browser.
        */
        stop: function() {
            chromeInstance.stdin.pause();
            chromeInstance.kill();
            chromeInstance = null;
        }
    },

    /**
     * Manage phantomjs instance. Spawning it's process, then using remote.
    */
    phantomjs: {
        /**
         * Start phantomjs.
         *
         * @param {String} path             The path (not used)
         * @param {Integer} port            The port (not used)
         * @param {Function} callback       The callback
        */
        start: function(path, port, callback) {
            var phantom = require('phantom');

            phantom.create(function (ph) {
                phantomInstance = ph;
                callback(path, port);
            });
        },

        /**
         * Send a command to an existing phantomjs instance.
         *
         * @param {String} url              The url to call
         * @param {String} cmd              The command to send
         * @param {Object} scope            The command scope (not used)
         * @param {Function} callback       The callback to call when response
         *                                  arrives
        */
        command: function(url, cmd, scope, callback) {
            phantomInstance.createPage(function (page) {
                page.open(url, function (status) {
                    page.evaluate(function (cmd) {
                        return eval(cmd);
                    }, function (result) {
                        callback(false, result);
                    }, cmd);
                });
            });
        },

        /**
         * Stop phantomjs browser.
        */
        stop: function() {
            phantomInstance.exit();
            phantomInstance = null;
        }
    }
};
