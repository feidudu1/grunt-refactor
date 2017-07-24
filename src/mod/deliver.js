/**
 *  透传
 */
;(function ($, mod) {

    mod.deliver = {
        init: function (paramsList) {
            var httpUrl = new lib.httpurl(location.href);
            this.hostName = httpUrl.origin;
            this.params = httpUrl.params;


            //this.code = this.params['_code_'] || '';

            if (this.getParams(paramsList)) {
                return;
            }

            this.addEvent();
        },

        addEvent: function () {
            var that = this;
            $('body').on('click', 'a', function (e) {
                var $self = $(this);
                var href = $self[0].href;
                var url = '';

                if (href) {
                    var lowerHref = href.toLowerCase();
                    if (lowerHref.indexOf('javascript') == -1 && lowerHref.indexOf('tel:') == -1) {
                        url = href;
                    }
                }

                if (url) {
                    e.preventDefault();
                    that.deliverUrl(url);
                }
            })
        },

        deliverUrl: function (url) {
            if (!url) return;

            if (url.indexOf('http://') == -1) {
                url = [location.protocol, '//', location.host, location.pathname.replace(/(.*)\/([^\/]*)/, '$1/'), url].join('');
            }

            // todo 先写死 _code_
            if (!this.noParam) {
                var httpurl = new lib.httpurl(url);
                for(var i in this.paramsList){
                    httpurl.params[i] = this.paramsList[i];
                }

                location.href = httpurl.toString();
            } else {
                location.href = url;
            }
        },

        // 保留当前所有参数的跳转
        redirectUrl: function (url, method) {
            if (!url) return;

            if (url.indexOf('http://') == -1) {
                url = [location.protocol, '//', location.host, location.pathname.replace(/(.*)\/([^\/]*)/, '$1/'), url].join('');
            }

            var httpurl = new lib.httpurl(url);
            for(var i in this.params){
                httpurl.params[i] = this.params[i];
            }

            if (method == 'replace') {
                location.replace(httpurl.toString());
            } else {
                location.href = httpurl.toString();
            }
        },

        getParams: function(paramsList){
            this.noParam = true;
            this.paramsList = {};
            for(var i in paramsList){
                if(this.params[paramsList[i]] || lib.cookie.get(paramsList[i])){
                    this.paramsList[paramsList[i]] = this.params[paramsList[i]] || lib.cookie.get(paramsList[i]);
                    this.noParam = false;
                }
            }
            return this.noParam;
        }
    };

    // run
    $(function () {
        mod.deliver.init(['_code_','shop_id']);
    });

})(Zepto,  window['mod'] || (window['mod'] = {}))