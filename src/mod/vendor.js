/**
 * 帮助类
 *
 */
;(function ($, Global) {
    Global.helper = Global.helper || {};

    var helper = Global.helper;

    // 获取参数值
    helper.getParamsFromUrl = function () {

    };

    // 异步加载js
    helper.getScript = function (src, callback) {
        var script = document.createElement('script'),
            loaded;
        script.setAttribute('src', src);
        if (callback) {
            script.onreadystatechange = script.onload = function() {
                if (!loaded) {
                    callback();
                }
                loaded = true;
            };
        }
        document.getElementsByTagName('head')[0].appendChild(script);
    };

    // 检查某个dom结构是否ready
    helper.onDomReady = function (domSelector, callback) {
        (function () {
            document.querySelector(domSelector) ? callback() : setTimeout(arguments.callee, 200);
        })()
    };

    /**
     * @param price 价格，以分为单位
     */
    helper.filterPrice = function (price) {
        return Number(price/100).toFixed(2);
    };

    /**
     * @param current 现价
     * @param origin 原价
     */
    helper.getDiscount = function (current, origin) {
        return Number(current/origin*10).toFixed(1);
    };

})(Zepto, window.Global || (window.Global = {}))