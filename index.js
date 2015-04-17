
var Promise = require('bluebird');

var rp;

if(process && process.exit) {
    rp = require('request-promise');
}

if(window && window.location) {
    rp = function(opts) {
        return require('jquery').ajax(opts)
    };
}

var deepmerge = function(target, src) {
    var array = Array.isArray(src);
    var dst = array && [] || {};

    if (array) {
        target = target || [];
        dst = dst.concat(target);
        src.forEach(function(e, i) {
            if (typeof dst[i] === 'undefined') {
                dst[i] = e;
            } else if (typeof e === 'object') {
                dst[i] = deepmerge(target[i], e);
            } else {
                if (target.indexOf(e) === -1) {
                    dst.push(e);
                }
            }
        });
    } else {
        if (target && typeof target === 'object') {
            Object.keys(target).forEach(function (key) {
                dst[key] = target[key];
            })
        }
        Object.keys(src).forEach(function (key) {
            if (typeof src[key] !== 'object' || !src[key]) {
                dst[key] = src[key];
            }
            else {
                if (!target[key]) {
                    dst[key] = src[key];
                } else {
                    dst[key] = deepmerge(target[key], src[key]);
                }
            }
        });
    }

    return dst;
};

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
        this.config = deepmerge(this.config, _config);
    }

};

ConfigManager.prototype.handleResponse = function(body, response) {

    if(body === undefined) {
        return null;
    }

    return body;
};
ConfigManager.prototype.getOpts = function(_opts) {

    var options = deepmerge({
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