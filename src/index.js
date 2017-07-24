/**
 * Created by qianqian on 15/7/27.
 */
/**
 * Created by qianqian on 15/7/17.
 */
;(function ($, app) {
    var docEl = document.documentElement;
    var winW = docEl.getBoundingClientRect().width;

    var main = {
        init: function (opts) {
            lib.lazyload.init();
            lib.storage.rm('kuajin_auth_status');       //  跨境购-实名认证缓存
            lib.api.init({
                app_key:'@app_key',
                app_pwd:'@app_pwd',
                testApi:'@debugApi'
            });

            var httpUrl = new lib.httpurl(location.href);
            var params = httpUrl.params;
            // 判断是否为微小店
            if(params['shop_id']||lib.storage.get('shop_id')){
                //lib.storage.set('shop_id', lib.cookie.get('user_id'));
                var shop_id = params['shop_id']?params['shop_id']:lib.storage.get('shop_id');
                var _code_ = params['_code_']?params['_code_']:lib.cookie.get('_code_');
                location.replace("./shop.html?shop_id="+shop_id+'&_code_='+_code_);
                // 游览器刷新时候 return false 不然safari游览器会报错
                return false;
            }

            if(params['_code_']){
                lib.cookie.set('_code_',params['_code_'])
            }

            this.getData();
            // 分享配置
            if ('@custom_wx_share' == 'true') {
                this.addWeixinShare();
            }
        },

        renderBottom: function(data) {
            var tab_list = null, that = this, bgColor = '#fff';
            var httpUrl = new lib.httpurl(location.href);
            var params = httpUrl.params;
            var is_home = params['is_home'];
            if('@cfg_without_cate' != 'true') {
                if(data && data.navigation_bar && data.navigation_bar.valid) {
                    tab_list = data.navigation_bar.tab_list;
                    bgColor = data.navigation_bar.color;

                    $.each(tab_list, function(i, item) {
                        // 如果不是index.
                        if(item.is_default === 1 && (item.link.toLowerCase().indexOf(window.location.hostname) == -1 || item.link.toLowerCase().indexOf(window.location.hostname + '/index.html') == -1)){
                            if( is_home != '2' ){
                                location.href = item.link;
                                return false;
                            }
                        }
                    });

                    //判断hoverIndex
                    $.each(tab_list, function(i, item) {
                        if(/index.html/.test(item.link)) {
                            main.hoverIndex = i;
                            return false;
                        }
                    });
                }
            } else {
                tab_list = data;
            }
            this.bottombar = new ctrl.bottomBar({
                hoverIndex: main.hoverIndex,
                showBottom: true,
                color: "@main-color",
                bgColor: bgColor,
                barData: tab_list
            });
        },

        addWeixinShare: function () {
            lib.WeixinApi.init({
                url: '@wx_share_domain/wxsign/',
                debug: false,
                ready: function (Api) {
                    var wxData = {
                        "appId": Api.sign.appId,
                        "imgUrl" : '@custom_wx_logo',
                        "link" : location.href,
                        "desc" : "@custom_wx_desc",
                        "title" : "@custom_wx_title"
                    };

                    var wxCallbacks = {
                        cancel : function(resp) {
                        },
                        success : function(resp) {
                        }
                    };

                    Api.shareToFriend(wxData, wxCallbacks);
                    Api.shareToTimeline(wxData, wxCallbacks);
                    Api.shareToWeibo(wxData, wxCallbacks);
                    Api.shareToQQ(wxData, wxCallbacks);
                }
            })
        },

        addEvents: function () {
            var that = this;
            // 搜索栏颜色随着页面滑动的变化
            $(window).on('touchmove', function(){
                var top = document.documentElement.scrollTop || document.body.scrollTop;
            //     var _sHeight = winW*(368/640);
                // if(top>_sHeight){
                //     $('.search-wraper .search-ready-wraper').removeClass('search-ready-wraper').addClass('search-ready-wraper-main');
                // }else{
                //     $('.search-wraper .search-ready-wraper-main').removeClass('search-ready-wraper-main').addClass('search-ready-wraper');
                // }
            });
        },

        getData: function(){
            var that = this;
            // todo 首页配置抽离
            $.ajax({
                type: 'GET',
                url: '@index_url',
                dataType: 'jsonp',
                jsonp:'callback',
                success: function(data){
                    //console.log(data);
                    var data = JSON.parse(data);
                    var homeData = data.data.component;

                    for(var i=0;i<homeData.length;i++){
                        that.renderNext(homeData[i],i);
                    }

                    if ('@cfg_without_search' != 'true') {
                        // search bar
                        var sb = new ctrl.searchbar(null, {
                            maxHistoryNum: 20
                        });
                        document.querySelector('#search-bar').appendChild(sb.element);
                        sb.addEventListener('submit',function(e){
                            var q = e.submitMsg;
                            if (!q) {
                                alert("请输入搜索关键词");
                                return;
                            }
                            location.href = 'list.html?keyword=' + encodeURIComponent(q);
                        });
                        $('.placeholder').text('搜索');
                        $('.search-text').prop('placeholder','搜索商品');
                    }

                    // smart banner
                    //$('body').append('<div id="downapp" class="smart-banner"><div class="close" id="close"></div><img src="http://img01.taojae.com/party/7e4f478d17c89c3cbee9f4d3e534ec00.png" alt="download"/></div>');

                    //懒加载触发
                    lib.lazyload.trigger();

                    //搜索框监听事件
                    that.addEvents();

                },
                error: function(data){
                    console.log(data)
                }
            });
        },
        renderNext: function(data,index){
            var that = this;
            switch(data.valueType) {
                case 'imageBanner':
                    that.renderSlide(data.value,index);
                    break;
                case 'fourItemNav':
                    that.renderNav(data.value);
                    break;
                case 'dividerBlank':
                    that.renderDividerBlank(data.value);
                    break;
                case 'secKill':
                    that.renderSecKill(data.value);
                    break;
                case 'componentTitle':
                    that.renderComponentTitle(data.value);
                    break;
                case 'image':
                    that.renderImages(data.value);
                    break;
                case 'card':
                    that.renderCard(data.value);
                    break;
                case 'dividerLine':
                    that.renderDividerLine(data.value);
                    break;
                case 'marquee':
                    that.renderMarquee(data.value);
                    break;
                case 'product':
                    that.renderProducts(data.value);
            }
        },
        renderSlide: function (data,index) {
            var tpl = $('#tpl-slides').html();
            $('body').append(_.template(tpl)({
                itemList: data,
                w: winW,
                indexNum:index
            }));

            // slide show
            this.slider = new lib.Slider('.slider-box-'+index,{
                loop : true,
                play : true,
                trigger : '.slider-status-'+index
            });
        },
        renderNav: function (data) {
            var tpl = $('#tpl-cate-navs').html();
            $('body').append(_.template(tpl)({
                itemList: data
            }));
        },
        renderSecKill: function (data) {
            var that = this;

            var tpl = $('#tpl-secKill').html();
            $('body').append(_.template(tpl)({
                itemList: data.productList,
                startTime: data.startTime,
                endTime: data.endTime,
                screening: data.screening,
                systemTime: data.systemTime,
                targetText: data.targetText,
                targetUrl: data.targetUrl
            }));

            //设置商品排列的宽度
            $('.sec-kill .sec-body').css('width',data.productList.length*93.75+'px');

            //倒计时的序列号，页面如果有多个倒计时，可通过[i]来选择控制
            that.countId = 0;

            //先判断是该场次是否已经开始，然后计算倒计时的时间
            if(data.startTime&&data.systemTime){
                var time = 0;
                if(Date.parse(data.startTime.replace(/-/g, '/')) - Date.parse(data.systemTime.replace(/-/g, '/'))>0){
                    $('.time-tip').text('距离开始');
                    time = Date.parse(data.startTime.replace(/-/g, '/')) - Date.parse(data.systemTime.replace(/-/g, '/'));
                }else{
                    $('.time-tip').text('本场剩余');
                    time = Date.parse(data.endTime.replace(/-/g, '/')) - Date.parse(data.systemTime.replace(/-/g, '/'));
                }
            }

            //计算倒计时的时分秒，并传到倒计时的组件中去
            if(time){
                var hour = Math.floor(time/(3600*1000));
                var minute = Math.floor((time-hour*3600*1000)/(60*1000));
                var second = Number((time-hour*3600*1000-minute*60*1000)/1000).toFixed(1);

                var count = [hour,minute,second];
                that.renderTime(count,that.countId);
            }
        },

        renderDividerBlank: function(data){
            var tpl = $('#tpl-divider-blank').html();
            $('body').append(_.template(tpl)(data));
        },

        renderDividerLine: function(data){
            var tpl = $('#tpl-divider-line').html();
            $('body').append(_.template(tpl)(data));
        },

        renderMarquee: function (data) {
            var tpl = $('#tpl-marquee').html();
            $('body').append(_.template(tpl)(data));

            // init marquee effect
            new lib.marquee({
                targetEl: $('.marquee-box').last(),
                height: 26
            })
        },

        renderImages: function(data){
            var tpl = $('#tpl-images').html();
            $('body').append(_.template(tpl)(data));
        },

        renderCard: function (data) {
            var tpl = $('#tpl-cards').html();
            $('body').append(_.template(tpl)({
                type: data.type,
                needBorder: data.needBorder,
                itemList: data.itemList
            }));
        },

        renderComponentTitle: function (data) {
            var tpl = $('#tpl-component-title').html();
            $('body').append(_.template(tpl)({
                title: data.title,
                borderColor: data.borderColor,
                description: data.description,
                bgColor: data.bgColor,
                targetUrl: data.targetUrl
            }));
        },

        renderTime:function(count,index){
            var that = this;
            this.cd = [];

            var last_seconds = parseInt(count[0])*3600 + parseInt(count[1]*60) + parseInt(count[2]*10)/10;
            console.log(count[0],count[1],count[2],last_seconds);
            if( last_seconds > 0){
                that.cd[that.countId++] = lib.countdown({
                    endDate: "+"+last_seconds.toString(),
                    interval: 1000,
                    onUpdate: function(data){
                        //console.log(data);
                        var hour = data.days*24+data.hours;
                        $(".time .hour").text(hour<10?'0'+hour:hour);
                        $(".time .minute").text(data.minutes<10?'0'+data.minutes:data.minutes);
                        $(".time .second").text(data.seconds<10?'0'+data.seconds:data.seconds);
                    },
                    onEnd: function(){
                        console.log('cd['+index+'] ended');
                    }
                }).start();
                $(".time").show();

            }else{
                $(".time").remove();
            }

        },

        renderProducts: function (data) {
            var tpl = $('#tpl-products').html();
            $('body').append(_.template(tpl)({
                productType: data.productType,
                productList: data.productList
            }));
        }
    };

    // export
    app.index = main;

    // run
    $(function () {
        HDL.checkHigoMark(function (data) {
            HDL.renderBottom(data);
            app.index.init();
        });
    })
})(Zepto, window.app || (window.app = {}));
