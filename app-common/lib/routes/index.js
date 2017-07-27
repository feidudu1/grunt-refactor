var express = require('express');
var router = express.Router();
var apiList = require('../apps/api');
var configInfo = require('../apps/configInfo');

var getConfig = function (req,res,next) {
    req.api_data = {
        app_key: req.app_info.app_key,
        app_pwd: req.app_info.app_pwd,
		biz_name:req.biz_name,
		biz_desc:req.biz_desc,
		biz_keywords:req.biz_keywords
    };
    req.app_name = req.biz_code;
    req.placeholders = {
        "size_1x1": "http://img01.taojae.com/party/0834ccdcbc446e95037597fa397cd53d.png",
		"size_2x1": "http://img01.taojae.com/party/ca77274957a1de4b2354a2d99586114f.png",
		"size_3x1": "http://img01.taojae.com/party/6fed1b62e7e47421a9415d68982a0d9f.png",
		"category": "http://img01.taojae.com/party/c6664cc235588005ada895ebfcc74fe0.png"
    }
    next && next();
};

var bindRoutes = function (app) {
    rootRouter(app);
};
var rootRouter = function (app) {
    // 获取站点配置信息
    router.all('*',configInfo.getBizInfo,configInfo.getAppInfo,getConfig);

    /* GET home page. */
    router.get('/',function (req,res,next) {
        res.redirect('/index.html');
    })

    // 自身接口依赖：替换原有php的两个脚本
    router.get('/wxcode.php', apiList.getWXCode);
    router.get('/wxsign', apiList.getWXSign);

    router.get('/:pagename.html',function (req,res,next) {
        var pagename = req.params.pagename;
        res.render(pagename,{
            main_color: req.main_color,

			api_data: req.api_data,
			app_key: req.app_info.app_key,
			app_pwd: req.app_info.app_pwd,
			debugApi: req.debugApi,
        },function (err,html) {
            if (error) {
                console.error(err);
                next();
            }else {
                res.send(html);
            }

        })

    });
    app.use('/',router);
};
