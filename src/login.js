/**
 * 登录页
 * Created by qianqian on 15/8/2.
 */
;(function ($) {
    var main = {
        init: function () {
            this.transmit();

            document.title = '登录';
            this.topbar = new ctrl.topBar({
                title:'登录',
                left:{
                    normal:true
                }
            });

            lib.api.init({
                app_key:'@app_key',
                app_pwd:'@app_pwd',
                testApi: "@debugApi"
            });

            if (lib.WXLogin.isWX()) {
                $('.third-login ul').addClass('in-weChat');
                $('.third-login').show();
                //$('.third-login ul .wechat').show();
            }

            // 初始化微信登陆
            var httpUrl = new lib.httpurl(location.href);
            var params = httpUrl.params;
            var redirectUrl = params['redirectUrl'] || '';
            var that = this;
            that.redirectUrl = encodeURIComponent(redirectUrl);
            var reg = /(user_id=).*\b/g;
            this.qr_user_id = '';
            if(redirectUrl.length && redirectUrl.match(reg)){
                var url = new lib.httpurl(redirectUrl);
                var urlParams = url.params;
                this.qr_user_id = urlParams['user_id'];
            }
            this.getMallSet();
            this.addEvents();
            this.checkSubmit();
        },

        checkSubmit: function(keyCode) {
            var checkSubmitCls = function() {
                if(!($('#username').val()) || !($('#password').val())){
                    $('#submit').removeClass('active');
                }
            };

            if(keyCode) {
                if(keyCode == 8){
                    checkSubmitCls();
                }
            } else {
                checkSubmitCls();
            }

            if(!!($('#username').val())&&!!($('#password').val())){
                $('#submit').addClass('active');
            }
        },

        addEvents: function () {
            var that = this;

            $('.j-register').on('click',function () {
                location.replace('register.html?redirectUrl='+that.redirectUrl);
            });

            $('#visual').on('click',function(e){
                e.stopPropagation();
                if($('input[type="checkbox"]:checked').length){
                    $('#password').attr('type','text');
                }else{
                    $('#password').attr('type','password');
                }
            });

            $('#submit').on('click', function () {
                if(!$(this).hasClass('active')){return;}
                that.submit();
            });

            $('input[type="text"],input[type="password"]').forEach(function(item){
                $(item).on('keyup',function(e){
                    //if(e.keyCode == 8){
                    //    if(!($('#username').val()) || !($('#password').val())){
                    //        $('#submit').removeClass('active');
                    //    }
                    //}

                    if(!!($('#username').val())&&!!($('#password').val())){
                        $('#submit').addClass('active');
                    }
                });
            });

            $('input[type="password"]').on('keydown', function(e){
                //if(e.keyCode != 8){
                //    if(!(e.keyCode > 47 && e.keyCode < 58) && !(e.keyCode > 64 && e.keyCode < 91)){
                //        e.preventDefault();
                //        return;
                //    }
                //}
            });

            //第三方登录
            $('#login-sina').on('click', function(){
                $('#wb_connect_btn').click();
            });

            $('#login-qq').on('click', function(){
                $('#qq_connect_btn').click();
            });

            setTimeout(function(){
                var ct = $('#username').val() && $('#password').val();
                if(ct){
                    $('#submit').addClass('active');
                }else if($('#username').val() && !$('#password').val()){
                    $('#password').val('');
                }
            },1000);
        },

        //参数传递
        transmit: function(){
            var httpUrl = new lib.httpurl(location.href);
            var params = httpUrl.params;
            params['redirectUrl'] = params['redirectUrl']? params['redirectUrl']:'';

            var redirectUrlLink='',redirectUrlLink2='';

            redirectUrlLink = params['redirectUrl'] ? "getpassword.html?redirectUrl=" + encodeURIComponent(params['redirectUrl']) : "getpassword.html";
            $('#forget').attr('href',redirectUrlLink);

            if(params['redirectUrl'].indexOf("cartfrom")>=0){
                var proType= params['redirectUrl'].indexOf("proType=1")>=0 ? 1 :  0;
                redirectUrlLink2 = params['redirectUrl'] ? "register.html?redirectUrl=order-confirm.html%3FproType%3D" + proType : "register.html";
            }else{
                redirectUrlLink2 = params['redirectUrl'] ? "register.html?redirectUrl=" + encodeURIComponent(params['redirectUrl']) : "register.html";
            }

            $('#register').attr('href',redirectUrlLink2);
        },

        // 登陆
        submit: function () {
            var that = this;

            if(that.isAjax){
                return false;
            }

            // 验证手机号码的合法性
            if (this.verify("tel")) {
                that.isAjax = true;

                // md5 password
                //lib.md5 && (this.password = lib.md5(this.password));
                var _data = {};
                var bizInfo = lib.storage.get('biz_info');
                if(that.qr_user_id && bizInfo.distributor_type == 3){
                    _data = {
                        login_name: this.loginName,
                        password: this.password,
                        login_type: this.login_type,
                        qr_user_id: that.qr_user_id,
                        attach_info: 'common-'+that.qr_user_id
                    }
                }else if(that.minishop && bizInfo.distributor_type == 2){
                    _data={
                        login_name: this.loginName,
                        password: this.password,
                        login_type: this.login_type,
                        attach_info: 'minishop-'+that.minishop
                    }
                }else{
                    _data = {
                        login_name: this.loginName,
                        password: this.password,
                        login_type: this.login_type,
                        qr_user_id: that.qr_user_id
                    }
                }
                lib.api.post({
                    api : 'user/login',
                    ssl: true,
                    data: _data,
                    success: function (data) {
                        var redirectUrl = null;
                        //console.log(data);
                        lib.storage.set('cartNum','');

                        lib.login.login(data, that.loginName, redirectUrl);
                    },

                    error: function (data) {
                        if (data && data.msg) {
                            alert(data.msg);
                        }
                        console.error(data);
                    },

                    complete: function () {
                        that.isAjax = false;
                    }
                })
            }
        },

        // 验证
        verify: function () {
            var that = this;

            this.loginName = $('#username').val();
            this.password = $('#password').val();

            // 校验
            if(/^[0-9]{11}$/.test(this.loginName)){ //判断用户名是否是手机号码
                that.login_type = 1;
            }else if(/^([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(this.loginName)){ //判断用户名是否是邮箱
                that.login_type = 2;
            }else{
                lib.notification.simple('用户名不正确，请重新输入','',1000);
                return false;
            }
            if(this.password.length == 0){
                lib.notification.simple('密码不能为空','',1000);
                return false;
            }else if(this.password.length<6) {
                lib.notification.simple('密码长度不足6位', '', 1000);
                return false;
            }

            return true;
        },

        // 获取基本信息
        getMallSet: function() {
            var that = this;
            if(this.mallAjax) {return;}
            this.mallAjax = true;
            lib.api.get({
                api: 'auth/session_token/get',
                data: {},
                success: function(data) {
                    var biz_info = data.data.biz_info;
                    if( biz_info.register_enable == 0 ){
                        $('.j-register').remove()
                    }else{
                        $('.j-register').show()
                    }
                    // 微小店
                    if(biz_info.distributor_type && biz_info.distributor_type == 2 ){
                        that.minishop = lib.storage.get('minishop');
                    }
                },
                error: function() {
                },
                complete: function() {
                    that.mallAjax = false;
                }
            });
        }

    };

    $(function () {
        main.init()
    });

})(Zepto)
