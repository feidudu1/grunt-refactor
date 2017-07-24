/**
 * 选择省市区
 *
 * @requires
 * js:  ../../shares/ctrl/ctrl-selectmenu/build/selectmenu.js
 * css: @import "../../../shares/ctrl/ctrl-selectmenu/build/selectmenu.css";
 *
 * @use
 *
 app.selectAddress.init({
        confirmText: '',
        title: '',
        cancelText: '',
        trigger: '',  // html element object
        onConfirm: function (selectedValue) {}
      })
 *
 * @author 景烁
 *
 */
;(function ($, app) {

    var instance;
    var caches = {};
    // 默认杭州
    var local = {'content':{'address_detail':{'province':'浙江省','city':'杭州市'}}};
    var isAjax = false;
    var lodingData = [
        {
            key: '加载中...',
            value: 0,
            selected: 1
        }
    ];
    var nullData = [
        {
            key: '我不清楚',
            value: 0,
            selected: 1
        }
    ];
    var minDepth = 1;

    function getArea (areaId, cb) {
        if (caches[areaId]) {
            cb(caches[areaId]);
            return;
        }

        var emptyData = [{id:'',name:'我不清楚',code:areaId}];

        lib.api.get({
            api: 'delivery/sub_region/list',
            //needLogin: true,
            data: {
                region_code: areaId
            },
            success: function (data) {

                data.data && cb(data.data);
                //console.log(data);
                caches[areaId] = data.data;

            },
            error: function (error) {
                console.error(error);
                cb(emptyData);
                caches[areaId] = emptyData;
            }
        });
    }

    function initData (opts){
        var defaultAddr = {};
        var addrData = {};
        var _code = opts.code || 'CN';
        var deep = opts.deep || 4;
        minDepth = opts.minDepth ? opts.minDepth : minDepth;
        var cb = opts.onReady;
        var deepMap = {
            4: 'province',
            3: 'city',
            2: 'area',
            1: 'street'
        };

        // todo 增加弱网络支持
        // reset it's children column
        //if (instance ) {
        //    var columnIndex = deep;
        //    while (columnIndex--) {
        //        instance.linkage(deepMap[columnIndex], lodingData);
        //    }
        //}

        getArea(_code, function (addrs) {
            var grade = deepMap[deep];
            var localIndex = null;
            addrData[grade] = [];
            if(!addrs.region_list.length){
                addrs.region_list[0] = {
                    code:'',
                    name:'我不清楚'
                }
            }
            addrs.region_list.forEach(function (data, index) {
                if(local.content.address_detail[grade] && (data.name.indexOf(local.content.address_detail[grade])!=-1||local.content.address_detail[grade].indexOf(data.name)!=-1)){
                    localIndex = index;
                }
                var addr = {
                    key: data.name,
                    value: data.code,
                    selected: index === (localIndex || 0)
                };
                addrData[grade].push(addr);
            });

            defaultAddr[grade] = addrData[grade][localIndex||0];
            deep--;
            if (deep < minDepth) {
                cb && cb(addrData);
            } else {
                getArea(defaultAddr[grade].value, arguments.callee);
            }
        })

    }

    function init(addrData, opts){
        opts = opts || {};

        var SelectMenu = ctrl.selectmenu;
        instance = new SelectMenu({
            confirmText: opts.confirmText || '确定',
            title: opts.title || '',
            cancelText: opts.opts || '取消',
            trigger: opts.trigger,
            verifyMe:function(value){
                //console.log(value);
                return !isAjax;
            }
        });

        instance.viewModel = addrData;

        instance.addEventListener('confirm', function (e) {
            //console.log(isAjax);
            if(!isAjax){
                opts.onConfirm(this.selectedValue);
            }
        });

        instance.addEventListener('select', function (colName) {
            var selectedId = this.selectedValue['val-' + colName];
            var that = this;
            //console.log(isAjax);
            isAjax = true;
            if (minDepth < 4 && colName == 'province') {
                initData({
                    code: selectedId,
                    deep: 3,
                    onReady: function (data) {
                        that.linkage('city', data.city);
                        that.linkage('area', data.area);
                        // that.linkage('street', data.street);
                    }
                })
            } else if (minDepth < 3 && colName == 'city') {
                initData({
                    code: selectedId,
                    deep: 2,
                    onReady: function (data) {
                        that.linkage('area', data.area);
                        // that.linkage('street', data.street);
                    }
                })
            } else if (minDepth < 2 && colName == 'area') {
                initData({
                    code: selectedId,
                    deep: 1,
                    onReady: function (data) {
                        that.linkage('street', data.street);
                    }
                })
            } else {
                isAjax = false;
            }
        });

        document.body.appendChild(instance.root);
    }

    app.selectAddress = {
        init: function (opts) {

            $.ajax({
                type: 'GET',
                url: 'http://api.map.baidu.com/location/ip?ak=7LKIOX88UcaHWrMDzN7coBub&coor=bd09ll&qt=loc&callback=?',
                data: { name: 'Zepto',type:"JSONP" },
                success: function(result){
                    // console.log(result);
//                    local.content.address_detail.province='西藏';
//                    local.content.address_detail.city='山南';
                    if (result.content && result.content.address_detail) {
                        local = result;
                    }
                    initData({
                        code:'CN',
                        deep: opts.deep,
                        minDepth: opts.minDepth,
                        onReady: function (data) {
                            init(data, opts);
                        }
                    });
                },
                error: function(xhr, type){
                    // console.log('Ajax error!');
                    initData({
                        onReady: function (data) {
                            init(data, opts);
                        }
                    },{'content':{'address_detail':{'province':'浙江省','city':'杭州市'}}});
                }
            });
        }
    };

})(Zepto,  window['app'] || (window['app'] = {}));
