/**
 * bottombar
 *
 * @author qianqian
 *
 * */
;(function(win, ctrl) {
    var $ = win['Zepto'];

    //配置
    var host = '';
    var url = [ host+"/index.html",host+"/categories.html",host+"/cart.html",host+"/mine.html"];

    //bottombar相关数据
    var defaultBarData = [
        {
            text: '首页',
            link: 'index.html',
            icon: '&#xe606;'
        },
        {
            text: '分类',
            link: 'categories.html',
            icon: '&#xe605;'
        },
        {
            text: '购物车',
            link: 'cart.html',
            icon: '&#xe604;'
        },
        {
            text: '我的',
            link: 'mine.html',
            icon: '&#xe607;'
        }
    ];
    var bottombar_html = renderBottomBar(defaultBarData);

    //circle相关数据
    var bottomCircle_html = '<div class="toolbar"><a href="javascript:void(0);" class="tool-main"></a><a href="'+url[0]+'" class="tool-index"></a><a href="'+url[1]+'" class="tool-categories"></a><a href="'+url[2]+'" class="tool-cart"></a><a href="'+url[3]+'" class="tool-mine"></a></div>';

    /**
     * 根据配置渲染底部内容
     * @param cfg
     * [{
     *      text: '',
     *      link: '',
     *      icon: ''
     * }, ...]
     */

    function renderBottomBar (cfg, hoverIndex) {
        var htm = [], i=0, span;
        cfg.forEach(function (val) {
            //本地配置
            if(val.icon) {
                htm.push('<li class="bbar">' +
                    '<a href="' + val.link + '">' +
                    '<i class="icon iconfont" data-icon="' + val.icon + '">' + val.icon + '</i>' +
                    '<p>' + val.text + '</p>' +
                    '</a>' +
                    '</li>');
            } else {
                //添加参数
                var httpUrl = new lib.httpurl(val.link);
                httpUrl.params.is_home = '2';
                var link = httpUrl.toString();

                //接口配置
                if(i == hoverIndex) {
                    span = '<span class="selected"><img src="'+val.icon_selected+'"></span>';
                } else {
                    span = '<span><img src="'+val.icon_unselected+'"></span>';
                }

                if(/act\.mockuai\.com/g.test(val.link)){
                    if(/\?/g.test(val.link)){
                        htm.push('<li class="bbar">' +
                            '<a href="' + link+'&hoverIndex='+i + '">' +span+
                            '<p>' + val.text + '</p>' +
                            '</a>' +
                            '</li>');
                    }else{
                        htm.push('<li class="bbar">' +
                            '<a href="' + link+'?hoverIndex='+i + '">' +span+
                            '<p>' + val.text + '</p>' +
                            '</a>' +
                            '</li>');
                    }
                }else{
                    htm.push('<li class="bbar">' +
                        '<a href="' + link + '">' +span+
                        '<p>' + val.text + '</p>' +
                        '</a>' +
                        '</li>');
                }

            }
            i++;
        })

        var htmlText = '<div class="bottombar"><ul>' + htm.join('') + '</ul></div>';
        return htmlText;
    };

    function renderShopbottom(cfg){
        var htm = [];
        cfg.forEach(function (val) {
            htm.push('<li class="bbar">' +
                '<a href="' + val.link + '">' +
                '<i class="icon iconfont" data-icon="' + val.icon + '">' + val.icon + '</i>' +
                '<p>' + val.text + '</p>' +
                '</a>' +
                '</li>')
        })

        var htmlText = '<div class="bottombar"><ul>' + htm.join('') + '</ul></div>';
        return htmlText;
    }

    // constructor
    function BottomBar(options) {
        this.options = {};
        $.extend(this.options, options || {});
        this._init();
    }

    $.extend(BottomBar.prototype, {
        // 初始化
        _init: function () {
            var that = this;

            //容器适配
            var ua = window.navigator.userAgent.toLowerCase();
            if(ua.match(/MicroMessenger/i)){
                this.options.showBottom = true;
                this.options.showCircle = false;
            }else if(ua.match(/Mockuai/i)){ //客户端内
                return;
            }


            //显示或隐藏bottombar
            if(this.options.showBottom){
                //选中的地址置空
                if(this.options.hoverIndex>=0){
                    url[this.options.hoverIndex] = "javascript:;";
                }

                //添加HTML
                if(location.href.indexOf('categories.html')>-1){
                    $('body').css('padding-bottom','50px');
                }else{
                    $('body').css('padding-bottom','50px');
                };

                bottombar_html = this.options.barData?renderBottomBar(this.options.barData, this.options.hoverIndex):bottombar_html;
                $('body').append(bottombar_html);

                //选中状态
                var $it = $('.bottombar').find('li').eq(this.options.hoverIndex);
                $it.find('a').css('color',this.options.color);
                $it.find('.iconfont').text($it.find('.iconfont').attr('data-icon'));
                $('.bottombar').css('background-color', this.options.bgColor);

                that.show('bottombar');
            }else{
                that.hide('bottombar');
            }

            //显示bottomCircle
            if(this.options.showCircle){
                bottomCircle_html = this.options.bottomCircleHtml?this.options.bottomCircleHtml:bottomCircle_html;
                //添加HTML
                $('body').append(bottomCircle_html);

                //激活nav
                $('.tool-main').on('touchstart', function(e){
                    $(this).closest('.toolbar').toggleClass('active');
                    e.preventDefault();
                });

                //click
                $(".toolbar a").on("click",function(e){
                    var $self = $(this);
                    if($self.attr("href").indexOf("h5.ve.cn")>=0){
                        $self.parent().removeClass("active");
                        setTimeout(function () {
                            location.href = $self.attr('href');
                        }, 500);
                        e.preventDefault();
                    }
                });
                $(".toolbar").css("bottom",10+"px");

                that.show('toolbar');
            }else{
                that.hide('toolbar');
            }
        },
        hide: function(obj){
            $(obj).hide();
        },
        show: function(obj){
            $(obj).show();
        }
    });

    ctrl.bottomBar = BottomBar;

})(window, window['ctrl'] || (window['ctrl'] = {}));