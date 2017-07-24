/**
 * Created by lancet on 2014/12/5.
 */
;(function($, lib) {
    var RAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function(c) { setTimeout(c, 1/60 * 1000); };
    // 默认配置
    var defoptions = {
    };
    // constructor
    function Dialog(options) {
        this.options = {};
        $.extend(this.options, defoptions, options || {});
        this._init();
    }
    $.extend(Dialog.prototype, {
        // 初始化
        _init: function() {
            var opts = {};
            this.box = $(this.options.boxClass);
            this.boxChild = this.box.children();
            this.trigger = $(this.options.triggerClass);
            this.triggerInner = $(this.options.triggerInnerClass);
            this.hideTrigger = $(this.options.hideClass);
            this.showHandler = this.options.onShow;
            this.showAllHandler = this.options.onShowAll;
            this.hideHandler = this.options.onHide;
            this.obj = null;
            this.addEvent();
        },
        addEvent: function () {
            var that = this;
            $('body').on('click', this.options.triggerClass, function () {
                that.obj = this;
                that.show();
                lib.lazyload.trigger();
            });



            $('body').on('click', this.options.triggerInnerClass , function () {
                that.obj = this;
                that.showAll();
                lib.lazyload.trigger();
            });

            this.box.on('click', function (e) {
                that.hide();
            });

            this.boxChild.on('click', function (e) {
                e.stopPropagation();
                return false;
            });
            this.hideTrigger.on('click', function () {
                that.hide();
            })
        },
        show: function () {
            this.box.show();
            this.showHandler && this.showHandler();
        },

        showAll: function () {
            this.box.show();
            this.showAllHandler && this.showAllHandler();
        },

        hide: function () {
            this.box.hide();
            this.hideHandler && this.hideHandler();
        }
    });
    // node
    $.fn.dialog = function(options) {
        if (!options) {
            options = {};
        }
        options.trigger = this;
        return new Dialog(options);
    };
    lib.Dialog = Dialog;
})(Zepto, (window.lib) ? window.lib : (window.lib = {}))