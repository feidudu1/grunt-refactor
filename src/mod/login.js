/*
 * 登陆组件验证
 *
 * @requires lib.storage
 * @author 景烁
 */
;(function(win, lib) {
    var helper = {
        getParamsFromUrl: function () {
            var query_string = {};
            var query = window.location.search.substring(1);
            var vars = query.split("&");

            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");

                // If first entry with this name
                if (typeof query_string[pair[0]] === "undefined") {
                    query_string[pair[0]] = pair[1];
                    // If second entry with this name
                } else if (typeof query_string[pair[0]] === "string") {
                    var arr = [ query_string[pair[0]], pair[1] ];
                    query_string[pair[0]] = arr;
                    // If third or later entry with this name
                } else {
                    query_string[pair[0]].push(pair[1]);
                }
            }
            return query_string;
        },
        getUserInfo: function(callback){
            lib.api.get({
                api:'user/current_user/get',
                data:{
                    access_token: lib.cookie.get('access_token')
                },
                success: function(data){
                    //console.log(data);
                    lib.cookie.set('user_id', data.data.user.id);
                    lib.cookie.set('invitation_code', data.data.user.invitation_code);
                },
                error: function(data){
                    console.log(data);
                },
                complete: function(){
                    callback && callback();
                }
            });
        }
    };

    // 微信相关的
    lib.WXLogin = {
        params: null,

        init: function (options) {
            this.APPID = options.APPID;
            this.wx_domain = options.wx_domain;
            this.qr_user_id = options.qr_user_id;
            this.minishop = options.minishop;
            lib.notification && lib.notification.msg('微信自动登录中...').show();

            // 微信内部
            if (!this.isWX()) return;
            var options = options || {};

            // 拉起微信支付
            this.wxCode = this.getCode() || '';

            //alert(this.wxCode);

            if (this.wxCode) {
                this.login(options.callback);
            } else {
                //alert('request auth');
                this.requestAuth();
            }

            return this;
        },

        isWX: function () {
            var ua = window.navigator.userAgent;
            if (ua.match(/MicroMessenger\/([\d\.]+)/)) {
                return true;
            }
            return false;
        },

        getQuery: function () {
            if (!location.search) {
                return {};
            }

            var queries = location.search.slice(1).split('&');
            var params = {};
            queries.forEach(function (q) {
                var data = q.split('=');
                params[data[0]] = data[1];
            });

            return params;
        },

        getCode: function () {
            if (!this.params) {
                this.params = this.getQuery();
            }
            return this.params.code;
        },

        requestAuth: function () {
            var that = this;

            // 微信的oAuth
            var APPID = that.APPID;

            // REDIRECT_URI 拼接规则
            // 如果配置的 wx_domain 是域名不带路径的， 则走 wxcode.php 服务
            // 否则 则 wx_domain 提供的服务, 带有相关的路径服务
            var wxUrl;
            if (that.wx_domain.match(/^http:\/\/([^\/]+)$/)) { // 默认魔筷服务最后面不带 /
                wxUrl = that.wx_domain + '/wxcode.php';
            } else {
                wxUrl = that.wx_domain;
            }

            var REDIRECT_URI = encodeURIComponent(wxUrl + '?redirectUri=' + encodeURIComponent(location.href));
            var SCOPE = 'snsapi_userinfo'; // 应用授权作用域，snsapi_base （不弹出授权页面，直接跳转，只能获取用户openid），snsapi_userinfo （弹出授权页面，可通过openid拿到昵称、性别、所在地。并且，即使在未关注的情况下，只要用户授权，也能获取其信息）
            var STATE = 'mk1234';
            var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + APPID + '&redirect_uri=' +
                REDIRECT_URI + '&response_type=code&scope=' + SCOPE + '&state=' + STATE +
                '&connect_redirect=1#wechat_redirect';
            location.replace(url);

            // todo
            // 其他
        },

        login: function (callback) {
            var that = this;
            //var url = 'http://192.168.31.173:8090/user/wechat/login';
            //var data = {auth_code: this.wxCode}
            var bizInfo = lib.storage.get('biz_info');
            var _data={};
            if(that.qr_user_id && bizInfo.distributor_type == 3){
                _data={
                    auth_code: that.wxCode,
                    qr_user_id: that.qr_user_id,
                    attach_info: 'common-'+that.qr_user_id
                }
            }else if(that.minishop && bizInfo.distributor_type == 2){
                //alert('mini');
                _data={
                    auth_code: that.wxCode,
                    attach_info: 'minishop-'+that.minishop
                }
            }else{
                _data={
                    auth_code: that.wxCode,
                    qr_user_id: that.qr_user_id
                }
            }

            lib.api.post({
                api : 'user/wechat/login',
                data: _data,
                success: function (data) {
                    //console.log(d);
                    //alert(JSON.stringify(data));

                    callback && callback(data);
                },

                error: function (data) {
                    //alert(JSON.stringify(data));

                    if (data && data.msg) {
                        alert(data.msg);
                    }
                    console.error(data);
                },

                complete: function () {
                    //that.isAjax = false;
                }
            });
        }
    };

    lib.login = {
        // 判断是否登陆
        isLogin: function () {
            if (lib.WXLogin.isWX()) {
                // 微信登陆判断：必须绑定
                if (lib.cookie.get('bind_mark') != 1 && lib.cookie.get('already_bind') != 1) {
                    return false;
                } else {
                    return true;
                }
            }
            return !!lib.cookie.get('access_token');
        },

        // 跳转登陆页
        goLogin: function (redirectUrl, logout) {
            redirectUrl = redirectUrl || location.href;
            lib.cookie.set('access_token','');

            // 支持微信
            var logout = logout || false;
            var loginPage = (!logout && lib.WXLogin.isWX()) ? 'wx-login.html' : 'login.html';

            location.href = loginPage + "?redirectUrl=" + encodeURIComponent(redirectUrl);
        },

        // 登出
        logout: function (redirectUrl) {
            redirectUrl = redirectUrl || '';
            lib.cookie.rm('access_token');
            lib.cookie.rm('session_token');
            lib.cookie.rm('refresh_token');
            lib.cookie.rm('invitation_code');
            lib.cookie.rm('precode');
            var that = this;
            setTimeout(function () {
                that.goLogin(redirectUrl, true);
            }, 100);
        },

        // 登陆后写入数据
        login: function (logData, name, redirectUrl, callback) {
            //console.log(logData);
            if (!logData || !logData.data.access_token) {
                return;
            }

            // 最后跳首页
            if (!redirectUrl) {
                var params = helper.getParamsFromUrl();
                if (params['redirectUrl']) {
                    redirectUrl = decodeURIComponent(params['redirectUrl']);
                } else {
                    redirectUrl = 'index.html';
                }
            }

            lib.cookie.set('access_token', logData.data.access_token);
            lib.cookie.set('refresh_token', logData.data.refresh_token);
            lib.cookie.set('bind_mark', logData.data.bind_mark);
            lib.storage.rm('cartName');

            helper.getUserInfo(function(){
                location.replace(redirectUrl);
            });
        },

        syncAppLogin: function (cb) {
            if (navigator.userAgent.match(/Mockuai\/([\d\.]+)/)) {
                lib.api.get({
                    needLogin:true,
                    api:'auth/refresh_token/get',
                    success: function(data){
                        if (data.data && data.data.refresh_token) {
                            lib.cookie.set('refresh_token', data.data.refresh_token);
                        }
                        cb.call();
                    },
                    error: function(){
                        cb.call();
                    }
                })
            } else {
                cb.call();
            }
        },

        // 获取账号昵称
        getUserName: function () {
            return lib.storage.get('userName');
        }
    };
})(window, window['lib'] || (window['lib'] = {}))