/**
 * 列表页
 * Created by qianqian on 15/7/19.
 */

;(function ($) {
    Global.formatImgSrc = function (src) {
        var match = src.match(/^http:\/\/img\.ve\.cnttp(.+)_3\.jpg/);
        if (match) {
            return 'http' + match[1] + '.jpg';
        } else {
            return src;
        }
    };
    var main = {
        init: function () {
            var httpUrl = new lib.httpurl(location.href);
            var params = httpUrl.params;
            var that = this;
            this.title = '';
            this.item_group_uid = params['item_group_uid'] ? decodeURIComponent(params['item_group_uid']) : null;
            this.category_id = params['category_id'] ? decodeURIComponent(params['category_id']) : null;
            this.brand_id = params['brand_id'] ? decodeURIComponent(params['brand_id']) : null;
            this.keyword = params['keyword'] ? decodeURIComponent(params['keyword']) : null;
            // 默认综合排序
            this.order_by = params['order_by'] || 0;
            this.count = 20;
            this.offset = 0;
            this.asc = 0;

            lib.api.init({
                app_key:'@app_key',
                app_pwd:'@app_pwd',
                testApi:'@debugApi'
            });

            if( this.item_group_uid ){
                // 如果是商品分组
                // ps：商品分组的名称可以被修改
                // 所以要动态获取商品分组；
                that.getGroupTitle(function (data) {
                    if( data ){
                        that.title = data;
                    }else{
                        that.title = document.title;
                    }
                    that.renderStyle(this.asd);
                })
            }else{
                this.title = params['title'] ? decodeURIComponent(params['title']) : document.title;
                this.renderStyle(this.asd);
            }

            //获取上一次定位的位置
            that.lastscrolltop = sessionStorage.getItem('_scrollTop');

            document.title = this.title;

            this.type = (this.category_id && this.brand_id && this.keyword)?'all':this.category_id?'category':this.brand_id?'brand':this.keyword?'search':this.item_group_uid?'item_group_uid':'others';

            if(this.type == 'search'){
                $('body').css('paddingTop','40px').append('<div class="topSearch"><a href="javascript:history.go(-1);" class="top-back"></a><div class="input-box">' + decodeURIComponent(params['keyword']) + '</div></div>');
                //$('.topSearch input').val(decodeURIComponent(params['keyword']));
            }
            if(params['_code_']){
                lib.cookie.set('_code_',params['_code_']);
            }
            if(params['shop_id']){
                lib.storage.set("shop_id",params['shop_id']);
            }

            // gotop
            new lib.goTop();
            $('.mk-gotop').css('bottom','65px!important');

            //不合法提示
            if (!this.type) {
                this.renderError('param');
                return;
            }

            // search bar
            var sb = new ctrl.searchbar(null, {
                maxHistoryNum: 20,
                onlyPanel: true
            });
            document.querySelector('#ctrl-search').appendChild(sb.element);
            sb.addEventListener('submit',function(e){
                var q = e.submitMsg;
                if (!q) {
                    alert("请输入搜索关键词");
                    return;
                }
                location.href = 'list.html?keyword=' + encodeURIComponent(q);
            });
            this.searchBar = sb;

            // 初始化lazyload
            lib.lazyload.init();

            that.lastscrolltop = sessionStorage.getItem('_scrollTop');

            // 初始化scroll load
            this.infiniteScroll = lib.infiniteScroll.init({
                bufferPx: 150, // 距离低端px就触发onNear事件
                time: 200, // 设置延迟触发onNear
                onNear: function () {
                    if(that.type){
                        switch(that.type){
                            case 'all':
                                that.renderAll();
                                break;
                            case 'search':
                                that.renderSearch();
                                break;
                            case 'category':
                                that.renderCate();
                                break;
                            case 'brand':
                                that.renderBrand();
                                break;
                            case 'item_group_uid':
                                that.renderItemGroupUid();
                                break;
                            default:
                                that.render();
                        }
                    }
                },
                end: function () {
                    return that.isEnd;
                }
            });

            this.addEvents();
            // 分享配置
            if ('@custom_wx_share' == 'true') {
                this.addWeixinShare();
            }
            // this.asd();
        },

        asd: function () {
            var that =this;

            setRollBack(loadMore);
            // window.addEventListener('scroll', function(){
            //     if(document.body.scrollHeight -window.screen.availHeight-document.body.scrollTop<100){
            //         loadMore();
            //     }
            // });

            function setRollBack(loadMore){
                var scroll_top     = 0;

                //如果存在记录就回滚
                if(scroll_top=that.lastscrolltop ){
                    if(document.body.scrollHeight-window.screen.availHeight<scroll_top){
                        // if (!do_loadMore) {
                            do_loadMore(scroll_top,loadMore);
                        // }
                    }else{
                        window.scrollY = scroll_top;
                    }
                }

                window.addEventListener('scroll', function(){
                    sessionStorage.setItem('_scrollTop', document.body.scrollTop);
                });
            }

            //回调无限加载
            function do_loadMore(scroll_top,loadMore){
                loadMore(function(){
                    if(document.body.scrollHeight-window.screen.availHeight<scroll_top){
                        //回调
                        // if (!do_loadMore) {
                            do_loadMore(scroll_top,loadMore);
                        // }
                    }else{
                        window.scrollY = scroll_top;
                    }
                });
            };

            function loadMore( _callback){
                that.renderStyle(_callback);
                // if(_callback) _callback();
            }
        },

        addWeixinShare: function () {
            var that = this;
            lib.WeixinApi.init({
                url: '@wx_share_domain/wxsign/',
                debug: false,
                ready: function (Api) {
                    var wxData = {
                        "appId": Api.sign.appId,
                        "imgUrl" : '@custom_wx_logo',
                        "link" : location.href,
                        "desc" : that.title || document.title,
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

            $('.j-sort').on('click', function () {
                if($(this).hasClass('active') && $(this).attr('data-type')!='price'){
                    return;
                }
                that.sortHandler($(this));
            });

            $('#callApp').on('click', function(e) {
                var schema = location.href;
                schema = schema.replace(/test.h5/g, "h5");//线上不需要
                var params = true;
                var point = true;
                lib.callapp.gotoPage(schema, {point: point, params: params});
            });

            $('.topSearch').on('click', function () {
                that.searchBar.show();
            });
        },

        // 获取分组名称
        getGroupTitle: function(callback){
            var that = this;
            lib.api.get({
                api: 'shop/item/group/query',
                data:{
                    seller_id:that.item_group_uid.split('_')[0],
                    group_uid:that.item_group_uid
                },
                success: function (d){
                    var data = d.data;
                    callback && callback (data.shop_item_group_list[0].group_name);
                },
                error: function () {
                    console.log('error');
                },
                complete: function () {
                }
            });
        },

        //渲染类别与头部样式选择
        renderStyle: function(_callback){
            if(this.type == 'search') {
                //todo
                //this.searchBar = new ctrl.searchBar({
                //    //todo searchBar的完善
                //});
                this.renderSearch(false,_callback);
            }else{
                switch(this.type){
                    case 'all':
                        this.renderAll();
                        break;
                    case 'category':
                        this.renderCate();
                        break;
                    case 'brand':
                        this.renderBrand();
                        break;
                    case 'item_group_uid':
                        this.renderItemGroupUid();
                        break;
                    default:
                        this.render(false,_callback);
                }
                this.topbar = new ctrl.topBar({
                    title:this.title?this.title:document.title,
                    left:{
                        normal:true
                    }
                });
                //this.topbar.title = document.title = '商品列表';
            }
            $('body').on('click','.switch', function(){
                if($(this).hasClass('to-double')){
                    $(this).removeClass('to-double').addClass('to-single');
                    $('#items').removeClass('single-row').addClass('double-row');
                    lib.storage.set('listType',false);
                }else{
                    $(this).removeClass('to-single').addClass('to-double');
                    $('#items').removeClass('double-row').addClass('single-row');
                    lib.storage.set('listType',true);
                }
            });
        },

        // 排序：综合排序，价格、销量，彼此互斥
        // 价格、销量，排序切换
        // 价格由低到高、由高到低，采用toggle的形式
        sortHandler: function ($sortItem) {
            $('.j-sort').removeClass('active');
            $sortItem.addClass('active');

            var isActive = $sortItem.hasClass('active');
            var type = $sortItem.attr('data-type');
            if (type == 'price') {
                // 价格排序
                isActive && $sortItem.toggleClass('down-up');
                this.order_by = 2;
                if ($sortItem.hasClass('down-up')) {
                    $('.iconfont-font').removeClass('active').eq(1).addClass('active');
                    this.asc = 0;//降序
                } else {
                    $('.iconfont-font').removeClass('active').eq(0).addClass('active');
                    this.asc = 1;//升序
                }
            } else if(type == 'mount'){
                //销量降序
                this.order_by = 1;
                this.asc = 0;
            } else if(type == 'new'){
                //销量降序
                this.order_by = 3;
                this.asc = 0;
            } else {
                // 综合排序
                this.order_by = 0;
            }


            if(this.type){
                this.offset = 0;
                this.render(true);
            }
        },

        funcAjax: function(needReset,api,params,_callback){
            var that = this;

            that._callback = _callback;

            if (that.isAjax) {
                return;
            }
            this.isAjax = true;
            if (needReset) {
                this.offset = 0;
                this.infiniteScroll.remove();

                $('#items').html('');
                this.showTip('数据加载中...');
            }

            lib.api.get({
                api: api,
                data:params,
                success: function (data){
                    var data = data.data;
                    console.log(data);
                    that.hideTip();
                    if (Array.isArray(data.item_list) && data.item_list.length) {
                        that.renderItems(data.item_list);
                        that.offset++;
                        !that.infiniteScroll.started && that.infiniteScroll.start();
                    } else {
                        if (that.offset == 0) {
                            that.renderError('empty');
                        } else {
                            console.log(that.isEnd);
                            that.isEnd = true;
                        }
                    }
                },
                error: function () {
                    console.log('error');
                    that.renderError('network');
                },
                complete: function () {
                    that.isAjax = false;
                    if (that._callback) {
                        that._callback();
                    }
                },

                // mock 先
                //mock: {
                //    path: '../data/list.json'
                //}
            });
        },

        render: function(needReset,_callback){
            var data = {
                order_by: this.order_by,
                asc: this.asc,
                offset: this.offset*20,
                count: 20
            };
            this.category_id?data.category_id = this.category_id : '';
            this.brand_id?data.brand_id = this.brand_id:'';
            this.keyword?data.keyword = this.keyword:'';
            this.item_group_uid?data.item_group_uid = this.item_group_uid:'';

            this.funcAjax(needReset,'item/list',data,_callback);
        },

        //综合，category brand keyword
        renderAll: function(needReset){
            var data = {
                category_id: this.category_id,
                brand_id: this.brand_id,
                keyword: this.keyword,
                order_by: this.order_by,
                asc: this.asc,
                offset: this.offset*20,
                count: 20
            };
            this.funcAjax(needReset,'item/list',data);
        },

        //category
        renderCate: function (needReset) {
            var data = {
                category_id: this.category_id,
                order_by: this.order_by,
                asc: this.asc,
                offset: this.offset*20,
                count: 20
            };
            this.funcAjax(needReset,'item/list',data);
        },

        //brand
        renderBrand: function(needReset){
            var data = {
                brand_id: this.brand_id,
                order_by: this.order_by,
                asc: this.asc,
                offset: this.offset*20,
                count: 20
            };
            this.funcAjax(needReset,'item/list',data);
        },

        //item_group_uid
        renderItemGroupUid: function(needReset){
            var data = {
                item_group_uid: this.item_group_uid,
                order_by: this.order_by,
                asc: this.asc,
                offset: this.offset*20,
                count: 20
            };
            this.funcAjax(needReset,'item/list',data);
        },

        //keyword
        renderSearch: function (needReset,_callback) {
            var data = {
                keyword: this.keyword,
                order_by: this.order_by,
                asc: this.asc,
                offset: this.offset*20,
                count: 20
            };
            this.funcAjax(needReset,'item/list',data,_callback);
        },

        //商品渲染
        renderItems: function (itemList) {
            $('.info-tip').hide();

            var $target = $('#items');
            var tpl = $('#tpl-item').html();
            $target.append(_.template(tpl)({
                brand_id: this.brand_id,
                itemList: itemList
            }));

            if(lib.storage.get('listType')){
                $('.switch').removeClass('to-single').addClass('to-double');
                $('#items').removeClass('double-row').addClass('single-row');
            }else{
                $('.switch').removeClass('to-double').addClass('to-single');
                $('#items').removeClass('single-row').addClass('double-row');
            }
            lib.lazyload.trigger();
        },

        // type: empty, param, network
        renderError: function (type) {
            switch (type) {
                case 'param':
                    this.showTip('缺少必要参数');
                    break;
                case 'network':
                    this.showTip('服务器开小差啦');
                    break;
                case 'empty':
                    this.showTip('抱歉，没有找到符合条件的商品');
                    break;
            }
        },

        showTip: function (txt) {
            var $errorBox = $('.info-tip');
            $errorBox.html(txt).show();
        },
        hideTip: function () {
            var $errorBox = $('#info-tip');
            $errorBox.hide();
        }
    };

    // run
    $(function () {
        main.init();
    })
})(Zepto, window.Global || (window.Global = {}));
