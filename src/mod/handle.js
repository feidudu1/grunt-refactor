/**
 * Created by qianqian on 15/5/8.
 * 公共处理
 */

//价格
var HDL = (function () {
    var main = {

        init: function(){
            var that = this;
            var pathName = window.location.pathname;
            // 如果不是首页
            if( pathName != '/index.html' && pathName != '/' ){
                this.checkHigoMark(function (data) {
                    that.renderBottom(data)
                });
            }
            return this;
        },

        // 验证是否是跨境版本的
        checkHigoMark: function (cb) {
            lib.api.init({
                app_key:'@app_key',
                app_pwd:'@app_pwd',
                testApi:'@debugApi'
            });

            // 首页,刷新session_token
            if (location.href.indexOf('index.html') != -1) {
                lib.storage.rm('biz_info');
            }

            var bizInfo = lib.storage.get('biz_info') || {};
            // bizInfo 已经缓存
            if (typeof bizInfo.higo_mark != 'undefined') {
                cb && cb(lib.storage.get('biz_info'));
                return;
            }
            var that = this;
            if(this.mallAjax) {return;}
            this.mallAjax = true;
            lib.api.get({
                api: 'auth/session_token/get',
                data: {},
                success: function(data) {
                    var biz_info = data.data.biz_info;
                    lib.storage.set('biz_info', biz_info);

                    cb && cb(biz_info);
                },
                error: function() {
                    cb && cb.call();
                },
                complete: function() {
                    that.mallAjax = false;
                }
            });
        },

        renderBottom: function(data) {
            var tab_list,
                bgColor = '#fff',
                showBottom = false,
                hostName = window.location.hostname,
                pathName = window.location.pathname;
            var httpUrl = new lib.httpurl(location.href);
            var params = httpUrl.params;
            var is_home = params['is_home'];

            if(data && data.navigation_bar && data.navigation_bar.valid) {
                tab_list = data.navigation_bar.tab_list;
                bgColor = data.navigation_bar.color;

                //判断hoverIndex
                $.each(tab_list, function(i, item) {
                    var lowerCase = item.link.toLowerCase();
                    if(item.link.indexOf(pathName)>0 && item.link.indexOf('/detail.html')== -1){
                        main.hoverIndex = i;
                        showBottom = true;
                        return false;
                    }
                    // 如果是首页,但是配置的默认首页不是index.html
                    if( pathName == '/index.html' || pathName == '/' ){
                        if(item.is_default === 1 && (lowerCase.indexOf(hostName) == -1 || lowerCase.indexOf(hostName + '/index.html') == -1)){
                            if( is_home != '2' ){
                                location.href = item.link;
                                return false;
                            }
                        }
                    }
                });
            }

            if(pathName.indexOf('/dyr-index.html')!= -1){ // 代言人
                main.hoverIndex = 3;
                showBottom = true;
            } else if (pathName.indexOf('/shop.html')!= -1) { // 微小店
                main.hoverIndex = 0;
                showBottom = true;
            } else if( !tab_list ){ // 默认导航
                switch (pathName){
                    case '/mine.html':
                        showBottom = true;
                        main.hoverIndex = 3;
                        break;
                    case '/cart.html':
                        showBottom = true;
                        main.hoverIndex = 2;
                        break;
                    case '/categories.html':
                        showBottom = true;
                        main.hoverIndex = 1;
                        break;
                    case '/':
                    case '/index.html':
                        showBottom = true;
                        main.hoverIndex = 0;
                        break;
                }
            }
            if(showBottom){
                this.bottombar = new ctrl.bottomBar({
                    hoverIndex: main.hoverIndex,
                    showBottom: true,
                    color: "@main-color",
                    bgColor: bgColor,
                    barData: tab_list
                });
            }
            if(lib.login.isLogin()) {
                var bottombar_cart_num;
                // 获取购物车商品数量
                lib.api.get({
                    needLogin: true,
                    api: 'trade/cart/item/list',
                    success: function (data) {
                        var wholeData = data.data.cart_item_list;
                        //购物车为空
                        bottombar_cart_num = 0;
                        for(var i in wholeData) {
                            bottombar_cart_num += wholeData[i].number;
                        }
                        lib.storage.set('cartNum',bottombar_cart_num);
                        if(bottombar_cart_num){
                            // $('.cart-num').show().html(that.num);
                            $('.bbar').eq(2).find('span').append('<span class="bottombar-cart-num" style="position:absolute;color:#fff;background:#e85251;width:14px;height:14px;line-height:14px;-webkit-border-radius: 50%;-moz-border-radius: 50%;border-radius: 50%;-moz-background-clip: padding;-webkit-background-clip: padding-box;background-clip: padding-box;font-size: 8px;top: 4px;margin-left: -7px;text-align: center;">'+ bottombar_cart_num + '</span>');
                        }
                    },
                    error: function(data){
                    },
                    complete: function(){
                    }
                });
            }
        },

        //小数位为0直接显示整数，有一位显示一位，有多位显示两位
        price: function(data){
            if(data){
                var yuan = Number(data/100);
                var fixed0 = yuan.toFixed(0);
                var fixed1 = yuan.toFixed(1);
                var fixed2 = yuan.toFixed(2);

                if(Number(fixed0)==Number(fixed1) && Number(fixed1)==Number(fixed2)){
                    return fixed0;
                }else if(Number(fixed0)!=Number(fixed1) && Number(fixed1)==Number(fixed2)){
                    return fixed1;
                }else{
                    return fixed2;
                }
            }else{
                return 0;
            }
        },

        //保留两位小数
        pricetwo: function(data){
            return Number(data/100).toFixed(2);
        },

        // 时间比较
        /**
         *  type  0：YYYY-MM-DD格式  1：YYYY-MM-DD hh:mm:ss格式
         *  a     选择的时间
         *  b     当前时间
         *  msg   不合法时间的提示信息
         */
        timeCompare: function(a, b, type, msg) {
            var arr = a.split("-");
            var starttime = new Date(arr[0], arr[1], arr[2]);
            var starttimes = starttime.getTime();

            var arrs = b.split("-");
            var lktime = new Date(arrs[0], arrs[1], arrs[2]);
            var lktimes = lktime.getTime();

            if (starttimes < lktimes) {
                lib.notification.simple(msg,1000);
                return false;
            }
            return true;
        },

        deleteArrayItem: function(arr, value){
            for (var i = 0; i < arr.length; i++) {
                var index = -1;
                if (arr[i] == value) index = i;
                if(index>-1){
                    arr.splice(index, 1);
                }
                return arr;
            }
        },

        isEmptyObject: function (obj){
            for(var n in obj){return false}
            return true;
        },

        deleteRepeatFormArr: function(arr){
            var res = [];
            var json = {};
            for(var i = 0; i < arr.length; i++){
                if(!json[arr[i]]){
                    res.push(arr[i]);
                    json[arr[i]] = 1;
                }
            }
            return res;
        },

        // 拼装cdn大小控制参数
        // w: 宽带， h：高度, q： 质量, f: 图片格式
        formCdnSrc: function (src, w, h, q, f) {
            if (!src) {
                return '';
            }

            src = this.filterCdnBaseSrc(src);

            w = w || '200';
            h = h || '200';
            q = q || '90';
            f = f || 'jpg';

            return src + '@1e_' + w + 'w_' + h + 'h_' + q +'Q.' + f;
        },
        // 获取原图地址
        filterCdnBaseSrc: function (src) {
            if (src.indexOf('@') != -1) {
                return src.split('@')[0];
            }

            return src;
        }
    };

    return main.init();
})();
