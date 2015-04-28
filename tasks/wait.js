/*
 * grunt-appstorm
 * https://github.com/Deisss/appstorm-grunt
 *
 * Copyright (c) 2015 Deisss
 * Licensed under the MIT license.
 */

/**
 * Simple callback waiter system.
*/
function Waiter(callback) {
    this.counter  = 0;
    this.callback = callback || function() {};
};

Waiter.prototype = {
    /**
     * Increase the lock by 1.
    */
    lock: function() {
        this.counter++;
    },

    /**
     * Decrease the lock by 1.
     * If the lock arrives to 0, auto-start the final callback.
    */
    release: function() {
        this.counter--;
        if (this.counter <= 0) {
            this.callback();
        }
    }
};


module.exports = Waiter;