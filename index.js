
var Promise = require('bluebird');
var _ = require('lodash')
var rp = require('request-promise');

var ConfigManager = function(_config) {

    this.config = {
        baseUrl: "http://config.raptor.local",
        group: 'preferences',
        userid: null
    };

    if(_config) {
        this.config = _.assign(this.config, _config);
    }

}

ConfigManager.prototype.handleResponse = function(body, response) {

    if(body === undefined) {
        return null;
    }

    return body;
}

ConfigManager.prototype.getUrl = function(param, group, userid) {

    group = group || this.config.group;
    userid = userid || this.config.userid;

    if(!group) {
        throw new Error("At least a group has to be specified");
    }

    if(!userid) {
        throw new Error("An userid has to be specified");
    }

    var list = [
        this.config.baseUrl,
        userid,
        group,
    ];

    if(param) {
        list.push(param);
    }

    return list.join('/');
};

/**
 * @return Promise
 */
ConfigManager.prototype.getRequestParams = function(param, group) {

    param = param || null;

    var options = {}
    try {
        options = _.assign({
            json: true,
            transform: this.handleResponse
        }, {
            uri : this.getUrl(param, group),
            method : 'GET',
        })
    }
    catch(e) {
        return Promise.reject(e)
    }
    return Promise.resolve(options)
}

/**
 * @param String key of the value
 * @param String group of the value
 */
ConfigManager.prototype.get = function(param, group) {
    return this.getRequestParams(param, group).then(rp)
}

/**
 * @param String key of the value
 * @param mixed value value to set
 */
ConfigManager.prototype.set = function(param, value, group) {
    return this.save(value, group, param)
}

ConfigManager.prototype.save = function(value, group, param) {
    return this.getRequestParams(param, group)
        .then(function(options) {

            options.headers = options.headers || {}
            options.headers['Content-Type'] = 'application/json'
            options.method = 'PUT'
            options.body = value

            return Promise.resolve(options)
        })
        .then(rp)
}

/**
 * @param Object the new group of values to set
 * @param String group of the values
 * @param String key of the value
 */
ConfigManager.prototype.reset = function(value, group, param) {
    return this.getRequestParams(param, group)
        .then(function(options) {

            options.method = 'POST'
            options.body = value

            return Promise.resolve(options)
        })
        .then(rp)
}

/**
 * @param Object the new group of values to set
 * @param String key of the value
 */
ConfigManager.prototype.remove = function(param, group) {
    return this.getRequestParams(param, group)
        .then(function(options) {
            options.method = 'DELETE'
            return Promise.resolve(options)
        })
        .then(rp)
}

module.exports = ConfigManager;
