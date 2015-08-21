'use strict';
/**
 * 简单的表单验证插件
 * version: 1.0.0 (Wed, 29 April 2015)
 * @author Seven Tao
 * @requires jQuery
 *
 */


(function($) {
    var defaults = {

    },
        settings = {},
        D = $(document),
        B = $('body');

    $.fn.validate = function(options) {
        // 检验是否存在对象
        if (!this.length) {
            console.warn('对象不存在！');
            return;
        }

        var that = $(this),
            settings = $.extend({
                // 默认值
                rules: {},
                messages: {},
                submitBtn: $('[type=submit]', that),
                errorElement: $('.error-msg'),
                ajaxForm: false
            }, options);


        // 绑定input事件，清掉错误提示
        $.each(settings.rules, function(obj, rules) {
            $('[name=' + obj + ']').on('input', function(event) {
                settings.errorElement.html('');
            });
        });

        settings.submitBtn.click(function(event) {
            event.preventDefault();
            $(this).attr('disabled', 'disabled');
            // 遍历需要验证的项目
            for (var obj in settings.rules) {
                if (settings.rules.hasOwnProperty(obj)) {
                    // 当前项
                    var curObj = $('[name=' + obj + ']', that);
                    // 若隐藏着，则不验证
                    if (!curObj.is(':visible')) {
                        continue;
                    };
                    // 当前项需要的验证规则
                    var curMethods = settings.rules[obj],
                        // 当前值
                        curVal = curObj.val();
                    // 遍历当前项的验证规则
                    for (var method in curMethods) {
                        // 当前参数
                        var curParam = curMethods[method],
                            // 进行验证
                            result = settings.regs['' + method](curVal, curParam, curObj[0]);
                        if (!result) {
                            // 验证失败显示信息
                            var msg = settings.messages['' + obj]['' + method];
                            settings.errorElement.html(msg);
                            curObj.focus();
                            settings.submitBtn.removeAttr('disabled');
                            return;
                        };
                        // 验证通过移除信息
                        settings.errorElement.html('');
                    }
                };
            }
            // 表单提交
            if (!settings.ajaxForm) {
                settings.submitBtn.removeAttr('disabled');
                that.submit();
            } else {
                var ajaxForm = settings.ajaxForm;
                // 遍历ajax需要的data
                ajaxForm.data = {};
                for (var i = 0; i < ajaxForm.inputs.length; i++) {
                    var curName = ajaxForm.inputs[i],
                        curInput = $('[name=' + curName + ']', that);

                    if (!curInput.is(':visible') && curInput.attr('type') != 'hidden') {
                        continue;
                    };
                    var curVal = curInput.val();
                    ajaxForm.data['' + curName] = curVal;
                };
                // ajax提交
                $.ajax({
                        url: that.attr('action') ? that.attr('action') : ajaxForm.url,
                        type: that.attr('method') ? that.attr('method') : 'POST',
                        dataType: ajaxForm.dataType ? ajaxForm.dataType : 'json',
                        data: ajaxForm.data,
                        success: function(response) {
                            settings.ajaxForm.successCallback(settings, response);
                        }
                    })
                    .fail(function() {
                        settings.ajaxForm.failCallback(settings);
                    })
                    .always(function() {
                        settings.hideLoading();
                        settings.submitBtn.removeAttr('disabled');
                    });

            };
        });
    };

}(jQuery));
