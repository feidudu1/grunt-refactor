var express = require('express'),
	http = require('http'),
	urlModule = require('url'),
	cache = require('memory-cache'),
	Promise = require('promise'),
	Utils = require('../tools/utils'),
	querystring = require('querystring');

// h5应用api地址
var h5ApiList = {
	test: 'http://10.10.10.13:8090/',
	wapa: 'http://apiwapa.mockuai.com/',
	online: ''
};
// 配置信息获取地址
var infoApiList={
	test: '10.10.10.13',
	wapa: '115.29.243.66',
	online: 'appcenter.mockuai.net'
};

// 当前环境
var currentEnv = 'online';

var getBizInfo = function(req, res, next){
    var seqData = {
        host: req.host,
        api: '/appcenter/biz_info/get_by_domain.rest',
        content: querystring.stringify({domain_name:req.host})
    };

    req.debugApi = h5ApiList[currentEnv];

    Promise.all([(new Promise(function(resolve, reject){
        getInfo(seqData, function(data){

            // no biz info
            if (!(data.data && data.data.biz_info)) {
                reject();
                return;
            }

            req.biz_code = data.data.biz_info.biz_code;
            // todo 微信登录是否需要跳转绑定手机号
            if(req.biz_code == 'heyue'){
                req.cfg_without_bind_tel = true;
            }
            // todo 补充的配置 来自对应的json文件
            req.biz_type = data.data.biz_info.biz_type;
            req.biz_name = data.data.biz_info.biz_name;
            req.biz_desc = data.data.biz_info.biz_desc;
            req.biz_administrator = data.data.biz_info.biz_administrator;
            req.biz_mobile = data.data.biz_info.biz_mobile;
            req.biz_email = data.data.biz_info.biz_email;
            // todo 补充的配置 自己写的
            // @size_2x1
            //req.biz_size_1x1 = '';
            //req.biz_size_2x1 = '';
            //req.biz_size_3x1 = '';
            //req.biz_category_placeholder = '';
            req.biz_keywords =data.data.biz_info.biz_property_map.site_keywords ? data.data.biz_info.biz_property_map.site_keywords.value : '';
            //req.biz_qq_appid = '';
            //req.biz_qq_url = '';
            //req.biz_sina_appkey = '';
            //req.biz_app_pwd = '';
            //req.biz_app_key = '';
            req.biz_app_tel = data.data.biz_info.biz_property_map.cs_tel ? data.data.biz_info.biz_property_map.cs_tel.value : '';
            //req.biz_about_url = data.data.biz_info.biz_property_map.about_us ? data.data.biz_info.biz_property_map.about_us.site_keywords.value : '';
            //req.cfg_without_cate = false;
            req.cfg_without_search= data.data.biz_info.biz_property_map.is_search_available ? ((data.data.biz_info.biz_property_map.is_search_available.value == 1) ? false : true ) : false;
            req.custom_wx_share = data.data.biz_info.biz_property_map.is_wechat_share_conf_support ? ((data.data.biz_info.biz_property_map.is_wechat_share_conf_support.value ) == 1 ? true : false ): false;
            req.custom_wx_title = data.data.biz_info.biz_property_map.wechat_share_conf_title ? data.data.biz_info.biz_property_map.wechat_share_conf_title.value : '';
            req.custom_wx_logo = data.data.biz_info.biz_property_map.wechat_share_conf_logo ? data.data.biz_info.biz_property_map.wechat_share_conf_logo.value : '';
            req.custom_wx_desc = data.data.biz_info.biz_property_map.wechat_share_conf_desc ? data.data.biz_info.biz_property_map.wechat_share_conf_desc.value : '';
            if(req.custom_wx_title || req.custom_wx_logo || req.custom_wx_desc){
                req.custom_wx_share = true;
            }
            // 支付方式的配置
            if (typeof data.data.biz_info.biz_property_map.is_paytype_wechat_available != 'undefined') {
                req.weixinpay= data.data.biz_info.biz_property_map.is_paytype_wechat_available ? ( (data.data.biz_info.biz_property_map.is_paytype_wechat_available.value == 1 ) ? true : false ) : false;
                req.unionpay= data.data.biz_info.biz_property_map.is_paytype_unionpay_available ? (( data.data.biz_info.biz_property_map.is_paytype_unionpay_available.value == 1) ? true :false ) : false;
                req.alipay=  data.data.biz_info.biz_property_map.is_paytype_alipay_available ? ( (data.data.biz_info.biz_property_map.is_paytype_alipay_available.value == 1) ? true : false ) : false;
            } else {
                // 默认魔筷支持所有的
                req.weixinpay = true;
                req.unionpay = 'false';
                req.alipay = true;
            }

            req.main_color = data.data.biz_info.biz_property_map.biz_main_color ? data.data.biz_info.biz_property_map.biz_main_color.value : '#ff4b55';

            // im 联系客服
            //req.cs_online_url = data.data.biz_info.biz_property_map.cs_online_url ? data.data.biz_info.biz_property_map.cs_online_url.value : '';
            req.biz_service_url = data.data.biz_info.biz_property_map.cs_online_url ? data.data.biz_info.biz_property_map.cs_online_url.value : '';
            // 电话联系客服
            req.cs_tel = data.data.biz_info.biz_property_map.cs_tel ? data.data.biz_info.biz_property_map.cs_tel.value : '';

            // 关于我们
            req.about_us = data.data.biz_info.biz_property_map.about_us ? data.data.biz_info.biz_property_map.about_us.value : '';

            // 微信相关配置: 登录/分享
            // todo 分享独立
            var wxDefaultDomain = 'http://common2.mockuai.com';
            var wxDefaultAppId = 'wx1798992a7488963c';
            var wxDefaultAppSecret = '9290c6da2d77844711101fab8dc455a8';

            var wxDomain, wxAppId, wxAppSecret;
            if (data.data.biz_info.biz_property_map.wechat_login_h5_app_id) {
                var wxAppId = data.data.biz_info.biz_property_map.wechat_login_h5_app_id.value || wxDefaultAppId;
                if (wxAppId != wxDefaultAppId) {
                    wxDomain = 'http://' + req.host;
                } else {
                    wxDomain = wxDefaultDomain;
                }
            } else {
                wxAppId = wxDefaultAppId;
                wxDomain = wxDefaultDomain;
            }

            // 微信相关配置: 支付
            var wxPayDefaultDomain = 'http://common.mockuai.com';
            var wxPayDefaultAppId = 'wx9ef90a738a78031b'; // 新支付

            var wxPayDomain, wxPayAppId, wxPayAppSecret;
            if (data.data.biz_info.biz_property_map.wechat_h5_app_id) {
                var wxPayAppId = data.data.biz_info.biz_property_map.wechat_h5_app_id.value || wxPayDefaultAppId;
                if (wxPayAppId != wxPayDefaultAppId) {
                    wxPayDomain = 'http://' + req.host;
                } else {
                    wxPayDomain = wxPayDefaultDomain;
                }
            } else {
                wxPayAppId = wxPayDefaultAppId;
                wxPayDomain = wxPayDefaultDomain;
            }

            if (data.data.biz_info.biz_property_map.wechat_login_h5_app_secret) {
                wxAppSecret = data.data.biz_info.biz_property_map.wechat_login_h5_app_secret.value || wxDefaultAppSecret;
            } else {
                wxAppSecret = wxDefaultAppSecret;
            }

            // todo secret 的逻辑
            req.weixin = {
                wx_appid: wxAppId,
                wx_domain: wxDomain,
                wx_appsecret: wxAppSecret,
                wx_pay_appid: wxPayAppId,
                wx_pay_domain: wxPayDomain,
                wx_pay_appsecret: wxAppSecret,
                // todo 当前分享domain，跟登录一样
                wx_share_domain: wxDomain
            };

            // 其他相关的配置数据
            req.bizData = data.data.biz_info.biz_property_map;

            resolve();
        },function(){
            reject();
        });
    }))]).then(function(){ next && next(); }, function () {
        res.render('notopen');
    });
};

var getAppInfo = function(req, res, next){
    var seqData = {
        host: req.host,
        api: '/appcenter/app_info/wap/get.rest',
        content: querystring.stringify({biz_code:req.biz_code})
    };

    Promise.all([(new Promise(function(resolve, reject){
        getInfo(seqData, function(data){
            req.app_info = data.data.app_info;
            resolve();
        },function(){
            reject();
        });
    }))]).then(function(){
        next && next();
    });
};

//todo 本地缓存
var getInfo = function(seqObj, callback, errorback){

	var cacheFile;
	// 本地获取
	// todo 增加缓存时间的判断
	// todo 固定获取,仅供测试,及时注释
	//cacheFile = './cache_files/waptest.m.mockuai.net.biz.json';
	//var info = Utils.getJSONSync(cacheFile);
	//callback(info);
	//return;

	if(seqObj.host == 'localhost'){
		seqObj.host = 'demo.m.mockuai.com';
	}
	switch (seqObj.api) {
		case '/appcenter/biz_info/get_by_domain.rest':
			cacheFile = './cache_files/' + seqObj.host + '.biz.json';
			break;
		case '/appcenter/app_info/wap/get.rest':
			cacheFile = './cache_files/' + seqObj.host + '.app.json';
			break;
	}

	var info = Utils.getJSONSync(cacheFile);
	//console.dir(info);
	if (info) {
		callback(info);
		return;
	}

	//从java服务端获取应用的配置信息
	//if(seqObj.content === 'domain_name=192.168.31.110'){
	//	seqObj.content = 'domain_name=waptest.m.mockuai.net';
	//}
	var options = {
		hostname: infoApiList[currentEnv],
		port: (currentEnv == 'test') ? 18090 : 8080,
		path: seqObj.api + '?' + seqObj.content,
		method: 'GET'
	};
	//console.log('options');
	var httpReq = http.request(options, function (res) {
		//console.log(options);
		var resText = [];

		res.on('data', function (data) {
			resText.push(data);
		});
		res.on('end', function(){
			//console.log(resText);
			try {
				callback && callback(JSON.parse(resText));
			} catch (e){
				console.log(e);
			}
		});
	});
	httpReq.on('error', function(e) {
		errorback && errorback(e);
	});
	httpReq.end();
};

module.exports.getBizInfo = getBizInfo;
module.exports.getAppInfo = getAppInfo;
