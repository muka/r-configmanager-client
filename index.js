
var rp = require('request-promise');
var Promise = require('bluebird');
var _ = require('lodash');

var MissingParamError = function() {
    var args = Array.prototype.slice.call(arguments);
    Error.apply(this, args);
};

MissingParamError.prototype = Object.create(Error);
MissingParamError.prototype.constructor = MissingParamError;

var ConfigManager = function(_config) {

    this.config = {
        baseUrl: "http://config.raptor.local",
        group: 'preferences',
        userid: null
    };

    if(_config) {
        _.merge(this.config, _config);
    }

};

ConfigManager.prototype.handleResponse = function(body, response) {

    if(body === undefined) {
        return null;
    }

    return body;
};
ConfigManager.prototype.getOpts = function(_opts) {

    var options = _.merge({
        json: true,
        transform: this.handleResponse
    }, _opts);

//    console.log('%s %s', options.method, options.uri);
    return options;
};

ConfigManager.prototype.getUrl = function(param, group, userid) {

    group = group || this.config.group;
    userid = userid || this.config.userid;

    if(!group) {
        throw new MissingParamError("At least a group has to be specified");
    }

    if(!userid) {
        throw new MissingParamError("An userid has to be specified");
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

ConfigManager.prototype.get = function(param, group) {

    param = param || null;

    var options = this.getOpts({
        uri : this.getUrl(param, group),
        method : 'GET',
    });

    return rp(options);
};

ConfigManager.prototype.set = function(param, value, group) {
    return this.save(value, group, param);
};

ConfigManager.prototype.save = function(value, group, param) {

    param = param || null;

    var options = this.getOpts({
        uri : this.getUrl(param, group),
        method : 'PUT',
        body: JSON.stringify(value),
    });

    return rp(options);
};

ConfigManager.prototype.reset = function(value, group, param) {

    var options = this.getOpts({
        uri : this.getUrl(param, group),
        method : 'POST',
        body: value,
    });

    return rp(options);
};

ConfigManager.prototype.remove = function(param, group) {

    param = param || null;

    var options = this.getOpts({
        uri : this.getUrl(param, group),
        method : 'POST',
    });

    return rp(options);
};

module.exports = ConfigManager;