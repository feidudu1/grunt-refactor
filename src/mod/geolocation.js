/**
 * 定位并获取当前位置信息
 * 包括经纬度以及citycode
 *
 * geolocation 获取逻辑：
 *
 * 默认：
 * 如果在淘宝客户端，则采用windvane获取
 * 否则采用浏览器定位
 * useH5: true 强制使用H5
 *
 * 客户端依赖于lib.env
 *
 * citycode 获取采用 mtop 接口
 *
 *
 * @author 景烁
 * @created 2014-02-13
 */

;(function ($, lib) {
    // 帮助函数集
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
                    var arr = [query_string[pair[0]], pair[1]];
                    query_string[pair[0]] = arr;
                    // If third or later entry with this name
                } else {
                    query_string[pair[0]].push(pair[1]);
                }
            }
            return query_string;
        },

        isWindVaneEnvironment: function () {
            if (window.navigator.userAgent.match(/WindVane/i)) {
                return true;
            } else {
                return false;
            }
        }
    };

    var mod = {

        defaultOptions: {
            // 回调, 参数包括 经度x, 纬度y, 城市编码cityCode
            onComplete: null,
            onError: null,

            // 是否判定客户端切换城市条件下的调用
            switchCity: false,

            // 是否一定采用定位数据
            useLocal: false,

            // 是否采用H5定位，即使在客户端环境中
            useH5: false,

            // 默认杭州数据
            defaultPos: {
                x: '120.153576',
                y: '30.287459',
                cityCode: '330100'
            }
        },

        init: function (opts) {
            opts = opts || {};
            this.options = $.extend(true, {}, this.defaultOptions, opts);
            this.urlParams = helper.getParamsFromUrl();

            this.bindActions();

            var that = this;
            this.getPosition(that.options.onComplete);
        },

        // 事件处理
        bindActions: function () {
            var that = this;
            var customEvent = 1;
            $('body').one('app:error', function (e) {
                if (that.options.onError) {
                    that.options.onError();
                } else if (that.options.onComplete) {
                    var defaultPos = that.options.defaultPos;
                    that.customEvent = true;
                    that.options.onComplete(defaultPos.x, defaultPos.y, defaultPos.cityCode);
                } else {
                    console.error('定位失败');
                }
            })
        },

        // fn 的回调调用 fn(x, y)
        // x为经度；y为纬度
        getPosition: function (fn) {
            // 首选从 url 参数中获取 x(经度) y(纬度)
            var xPos, yPos, cityCode,
                urlParams = this.urlParams,
                that = this;

            xPos = Number(urlParams["x"] || urlParams["longitude"]);
            yPos = Number(urlParams["y"] || urlParams["latitude"]);
            cityCode = Number(urlParams["cityCode"]);

            if (xPos && yPos && cityCode) {
                if (this.options.switchCity || this.options.useLocal) {
                    geo();
                } else {
                    fn(xPos, yPos, cityCode);
                }
            } else {
                if (xPos && yPos) {
                    that.gc(xPos, yPos, function (d) {
                        fn(xPos, yPos, d.cityCode);
                    })
                } else {
                    geo();
                }
            }

            function geo() {
                var opts = {
                    enableHighAccuracy: false,
                    timeout: 5000,
                    maximumAge: 300000,
                    //获取详细地址描述信息
                    address: true
                };

                // windvane: native
                // 去掉手淘的调用
                //if (helper.isWindVaneEnvironment() && !that.options.useH5) {
                //   // alert('windvane');
                //    window.WindVane.call('WVLocation', 'getLocation', opts, success, error);
                //    return;
                //}

                // alert('h5');

                // h5
                // 浏览器获取数据
                if (navigator.geolocation) {
                    // helper.geoLoader.show();
                    navigator.geolocation.getCurrentPosition(success, error, opts);
                } else {
                    $('body').trigger('app:error', ['poi']);
                }
            }

            function success(pos) {
                // 用户定位对话操作监听标示
                //navigator.geolocation.received = true;

                //alert(JSON.stringify(pos));

                //helper.geoLoader.hide();
                var pos = pos.coords;
                if (xPos && yPos && cityCode && that.options.switchCity) {
                    // switch 判定模式
                    // cityCode 用户指定
                    // d.cityCode 当前定位数据
                    fn(xPos, yPos, cityCode);
                    //fn(xPos, yPos, cityCode, d.cityCode);
                } else {
                    fn(pos.longitude, pos.latitude);
                    //fn(pos.longitude, pos.latitude, d.cityCode);
                }
            }

            function error(d) {

                // alert(JSON.stringify(d));

                //helper.geoLoader.hide();
                if (xPos && yPos && cityCode && !that.options.useLocal) {
                    fn(xPos, yPos, cityCode);
                } else {
                    $('body').trigger('app:error', ['poi']);
                }
            }
        },

        // 地理逆编码
        // x: 经度； y: 纬度；fn: 回调
        // fn(data) 调用参数: data.cityName, data.cityCode
        gc: function (x, y, fn) {
//            if (!AMap) {
//                console.error('高德地图js包未加载哦');
//                return;
//            }
//
//            // cityCode 由参数提供
//            var urlParams = this.urlParams || {};
//            var cityCode = Number( urlParams["cityCode"] );
//            if (cityCode) {
//                fn(x, y, cityCode);
//                return;
//            }
//
//            var MGeocoder = new AMap.Geocoder({
//                //radius: 1000,
//                //extensions: "all"
//            });
//            var lnglatXY = new AMap.LngLat(x, y);
//            //逆地理编码
//            MGeocoder.regeocode(lnglatXY, function (data) {
//                fn(x, y, data.list[0].city.code);
//            });

            // 采用mtop接口：mtop.trip.common.getCityCodeByLatitudeAndLongitude

            lib.mtop.request({
                api: 'mtop.trip.common.getCityCodeByLatitudeAndLongitude',
                v: '1.0',
                data: {
                    longitude: x,
                    latitude: y
                }
            }, function (d) {
                if (d.data) {
                    fn.call(null, d.data);
                } else {
                    $('body').trigger('app:error', ['gc']);
                }
            }, function (d) {
                $('body').trigger('app:error', ['gc']);
                //console.error(d)  ;
            });

        }
    };

    lib.geolocation = mod;

})(Zepto, (window.lib) ? window.lib : (window.lib = {}))