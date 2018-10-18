(function () {
    'use strict';

    window.ClockPercent = function (elm, ext) {
        if (!(this instanceof window.ClockPercent)) {
            return new window.ClockPercent(elm, ext);
        }

        var self = this;

        var setting = {
            // origin: {x: 100, y: 100},
            width: 200,
            radius: 75,
            baseColor: '#999',
            coverColor: '#f00',
            strokeWidth: 3,
            rotation: 0,
            clockwise: true,
            value: 0
        };

        if (typeof(ext) == 'object') {
            Object.keys(ext).forEach(function (key) {
                if (setting.hasOwnProperty(key)) {
                    setting[key] = ext[key];
                }
            });
        }

        var centerLen = setting.width / 2;
        var draw = SVG(elm);
        var p2 = draw
                    .circle(2 * setting.radius)
                    .center(centerLen, centerLen)
                    .attr({'fill':'none', 'stroke':setting.baseColor,'stroke-width':setting.strokeWidth})
                    .transform({rotation: setting.rotation});
        var p1 = draw.path('M 0,0')
                    .center(centerLen, centerLen)
                    .attr({'fill':'none', 'stroke':setting.coverColor,'stroke-width':setting.strokeWidth})
                    .transform({rotation: setting.rotation});

        function getRadian(val) {
            return (2 * Math.PI * val / 100);
        }

        function formatString(str, replace) {
            Object.keys(replace).forEach(function (_k) {
                var val = replace[_k];
                var reg = new RegExp('%' + _k, 'g');

                str = str.replace(reg, val);
            });

            return str;
        }

        function updatePath(drawPath, radian) {
            var L;  // 弧邊直線長
            var A;  // x,y 的參考角角度
            var x;
            var y;
            var path;
            var conf = {
                ox: centerLen,         // 中心 X
                oy: centerLen,         // 中心 Y
                r: setting.radius,     // 半徑
                R: 2 * setting.radius, // 直徑
                c: 1,                  // 順時針
                arc: 0                 // 使用大弧度
            }; // 預設值

            if (radian >= Math.PI * 2) {
                radian = Math.PI * 1.9999;
            }

            L = setting.radius * 2 * Math.sin(radian / 2);
            A = (Math.PI - radian) / 2;

            y = L * Math.cos(A);
            x = L * Math.sin(A);

            if (x < 0) {
                conf.arc = 1;
            }
            if (!setting.clockwise) {
                conf.c = 0;
                x = -x;
            }

            path = 'M %ox,%oy m 0,-%r a %r,%r 0 %arc %c';
            path += ' ' + (Math.round(x * 1000) / 1000).toString();
            path += ' ' + (Math.round(y * 1000) / 1000).toString();

            path = formatString(path, conf);

            drawPath.plot(path);
        }
        updatePath(p1, getRadian(setting.value));

        function isNumeric(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }

        function setValue(val) {
            if (val > 100) {
                val = 100;
            } else if (val < 0) {
                val = 0;
            }

            setting.value = val;

            updatePath(p1, getRadian(setting.value));

            return self;
        }

        function getValue() {
            return setting.value;
        }

        self.val = function (val) {
            if (val === undefined) {
                return getValue();
            }
            if (!isNumeric(val)) {
                throw new Error('Not a number');
            }

            setValue(val);

            return self;
        };
        self.increment = function (diff) {
            if (!isNumeric(diff)) {
                throw new Error('Not a number');
            }
            if (diff < 0) {
                diff = 0;
            }
            if (diff === undefined) {
                diff = 1;
            }

            setValue(getValue() + diff);

            return self;
        };
        self.decrement = function (diff) {
            if (!isNumeric(diff)) {
                throw new Error('Not a number');
            }
            if (diff < 0) {
                diff = 0;
            }
            if (diff === undefined) {
                diff = 1;
            }

            setValue(getValue() - diff);

            return self;
        };

        return self;
    };
}());
