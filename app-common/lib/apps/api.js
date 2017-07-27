var express = require('express'),
    urlModule = require('url'),
    mopRequest = require('./mop');

var getWXCode = function (req,res) {
    var code = req.query.code;
    var redirectUri = req.query.redirectUri;

    if (!code || !redirectUri) {
        res.send('parameter error');
        return;
    }

    var query = urlModule.parse(redirectUri).query;
    if (query) {
        redirectUri += '&code=' + code;
    } else {
        redirectUri += '?code=' + code;
    }
    res.redirect(302,redirectUri);
};

var getWXSign = function (req, res) {
    var app_key = req.app_info.app_key;
    var app_pwd = req.app_info.app_pwd;

    mopRequest({
        type: 'post',
        api: 'wechat/js_sign/get',
        data: {
            url: req.query.url || (req.protocol + '://' + req.get('host') + req.originalUrl),
            app_id: req.weixin.wx_appid,
            app_secret: req.weixin.wx_appsecret,
			app_key: app_key
        },
        success: function (data) {
            var data2 ={};
			var data = data.data;

			data2.appId = data.app_id;
			data2.nonceStr = data.nonce_str;
			data2.timestamp = data.timestamp;
			data2.url = data.url;
			data2.signature = data.signature;
			data2.raw_string = data.raw_string;

			res.jsonp(data2);
        },
        error: function () {
            res.jsonp('出错了。。。');
        }
    }, app_key, app_pwd);
}

module.exports.getWXCode = getWXCode;
module.exports.getWXSign = getWXSign;
