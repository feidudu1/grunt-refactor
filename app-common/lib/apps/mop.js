/**
 * Created by 冬林 on 2017/4/28.
 */

'use strict';

var http = require('http');
var https = require('https');
var crypto = require('crypto');
var urlModule = require("url");
var querystring = require('querystring');
var mopApiUrl =  'http://api.mockuai.com/';
// var mopApiUrl = 'http://10.10.10.13:8090/';

/**
 * 获取 get 远程json数据
 * @param url
 * @param callback
 * @param errback
 */
function getJSON(url, callback, errback) {
    var resultData = '',
        option = urlModule.parse(url),
        HttpType = option.protocol.indexOf('https') > -1 ? https : http;

    HttpType.get(url, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (data) {
            resultData += data;
        });
        res.on('end', function () {
            var json = null;
            try {
                json = JSON.parse(resultData);
                callback && callback(json);
            } catch (e) {
                errback && errback(e);
                return false;
            }
        });
    }).on('error', function (e) {
        errback && errback(e.message);
    });
}
/**
 * 获取 post 远程json数据
 * @param url
 * @param data
 * @param callback
 * @param errback
 */
function postJSON(url, data, callback, errback) {

    var resultData = '',
        option = urlModule.parse(url),
        sendData = querystring.stringify(data),
        req,
        HttpType;

    option.method = 'POST';
    option.headers = {
        "Content-Type": 'application/x-www-form-urlencoded',
        "Content-Length": sendData.length
    };
    HttpType = option.protocol.indexOf('https') > -1 ? https : http;

    req = HttpType.request(option, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (data) {
            resultData += data;
        });
        res.on('end', function () {

            var json = null;
            try {
                json = JSON.parse(resultData);
                callback && callback(json);
            } catch (e) {
                errback && errback(e);
                return false;
            }

        });
    })
    req.on('error', function (e) {
        errback && errback(e.message);
    });
    req.write(sendData + "\n");
    req.end();
}

function md5(msg) {
    var newHash = crypto.createHash('md5');
    newHash.update(msg, 'utf8');
    return newHash.digest('hex');
}

function sortObject(o) {
    var sorted = {},
        key, a = [];

    for (key in o) {
        if (o.hasOwnProperty(key)) {
            a.push(key);
        }
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
        sorted[a[key]] = o[a[key]];
    }
    return sorted;
}

function makeSign(params, app_pwd) {
    params = sortObject(params);

    var dictionary = app_pwd;
    for (var key in params) {
        dictionary += (key + '=' + params[key] + '&');
    }
    dictionary = dictionary.slice(0, -1);
    dictionary += app_pwd;

    var api_sign = md5(dictionary);
    return api_sign;
}

function getSession(app_key, app_pwd, callback) {
    var data = {
        format: 'json',
        app_key: app_key,
        timestamp: Math.floor(Date.now() / 1000)
    };

    getJSON(mopApiUrl + 'auth/session_token/get?format=json&app_key=' + data.app_key + '&timestamp=' + data.timestamp + '&api_sign=' + makeSign(data, app_pwd), function (response) {
        callback && callback(response.data.session_token);
    });
}

// opts 格式
/*
 {
 type: 'get', // 或者 post
 api: 'shop/item/group/query',
 data:{},
 success: function (d){},
 error: function () {}
 }
 */
function request(opts, app_key, app_pwd) {
    var data = opts.data;
    data.format = 'json';
    data.app_key = app_key;
    data.timestamp = Math.floor(Date.now() / 1000);

    getSession(app_key, app_pwd, function (session_token) {
        data.session_token = session_token;
        data.api_sign = makeSign(data, app_pwd);

        var url = mopApiUrl + opts.api;

        if (opts.type == 'post') {
            // post

            postJSON(url, data, function (data) {
                opts.success && opts.success(data);
            }, function () {
                opts.error && opts.error();
            })
        } else {
            // get
            var query = [];
            for (var key in data) {
                query.push(key + '=' + data[key]);
            }
            url += '?' + query.join('&');

            getJSON(url, function (data) {
                opts.success && opts.success(data);
            }, function () {
                opts.error && opts.error();
            })
        }
    });
}

module.exports = request;