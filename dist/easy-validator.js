'use strict';
/**
 * 简单的表单验证插件
 * version: 1.0.0 (Wed, 29 April 2015)
 * @author Seven Tao
 * @requires jQuery
 *
 */


(function($) {
    $.fn.validate = function(options) {
        // 检验是否存在对象
        if (!this.length) {
            console.warn('对象不存在！');
            return;
        }

        var form = this,
            defaults = {
                rules: {},
                messages: {},
                feedbacks: {
                    sideMsg: $('.side-msg', form),
                    bottomMsg: $('.bottom-msg', form),
                    control: $('.feedback-control', form),
                    errorClass: 'has-error',
                    successClass: 'has-success'
                },
                submitBtn: $('[type=submit]', form),
                checkOnBlur: true,
                ajaxPost: false
            },
            settings = $.extend(true, defaults, options),
            waitingList = new Array(),
            rulesList = new Array();

        $.each(settings.rules, function(name, methods) {
            // 把需要验证的表单项传入一个空数组
            rulesList.push(name);
            waitingList.push(name);
            form.on('keydown', '[name=' + name + ']', function(event) {
                // event.preventDefault();
                resetFeedback();
            });


            // onBlur则绑定blur事件
            if (settings.checkOnBlur) {
                // 获取索引
                var curindex = $.inArray(name, rulesList);
                // console.log(curindex);
                form.on('blur', '[name=' + name + ']', function(event) {
                    event.preventDefault();
                    var item = {
                        name: name,
                        obj: $(this),
                        index: curindex
                    }
                    checkItem(item, methods);
                });
            };
        });

        settings.submitBtn.click(function(event) {
            event.preventDefault();
            var btn = $(this);
            btn.attr('disabled', true);

            if (settings.checkOnBlur) {
                if (waitingList.length > 0) {
                    checkForm();
                    btn.removeAttr('disabled');
                } else {
                    submitForm();
                }
            } else {
                checkForm();
                if (waitingList.length == 0) {
                    submitForm();
                } else {
                    btn.removeAttr('disabled');
                }
            }
        });


        // 表单提交
        var submitForm = function() {
            var ajaxPost = settings.ajaxPost;
            if (!ajaxPost) {
                form.submit();
                return;
            };
            // 需要忽略的表单项价格上ignore属性
            if (ajaxPost.ignore) {
                for (var i = 0; i < ajaxPost.ignore.length; i++) {
                    $('[name=' + ajaxPost.ignore[i] + ']').prop('ignore', true);
                };
            };
            // 序列表单内容为字符串
            var data = form.easySerialize();
            $.ajax({
                    url: ajaxPost.url ? ajaxPost.url : form[0].action,
                    type: ajaxPost.method ? ajaxPost.method : 'post',
                    dataType: ajaxPost.dataType ? ajaxPost.dataType : 'json',
                    data: data,
                    cache: false,
                    success: function(res) {
                        ajaxPost.success(res);
                    },
                    error: function(res) {
                        ajaxPost.error(res);
                    }
                })
                .always(function() {
                    settings.submitBtn.removeAttr('disabled');
                });
        }

        // 检验表单
        var checkForm = function() {
            for (var i = 0; i < rulesList.length; i++) {
                var name = rulesList[i];
                var item = {
                    name: name,
                    obj: $('[name=' + name + ']', form),
                    index: i
                }
                var methods = settings.rules[name];
                checkItem(item, methods);
            };
        }

        // 逐项检验
        var checkItem = function(item, methods) {
            // console.log(item);
            // console.log(methods);
            var result = false;
            for (var method in methods) {
                // console.log(m);
                // console.log(methods[m]);
                var obj = item.obj;
                var value = obj.val();
                var param = methods[method];
                // 判断是否是自定义验证方法
                if (typeof(param) == 'function') {
                    result = param(value, obj);
                } else {
                    result = regs[method](value, param, obj);
                };
                // console.log(result);
                if (!result) {
                    feedback(result, item, method);
                    var errIndex = $.inArray(item.name, waitingList);
                    if (errIndex < 0) {
                        waitingList.push(item.name);
                    };
                    return;
                } else {
                    feedback(result, item, method);
                }
            }
            // 最终当前表单项是否为通过
            if (result) {
                var errIndex = $.inArray(item.name, waitingList);
                if (errIndex > -1) {
                    waitingList.splice(errIndex, 1);
                };
            }
        }

        // 消息反馈
        var feedback = function(result, item, method) {
            var msg = settings.messages[item.name][method],
                curSideMsg = settings.feedbacks.sideMsg.eq(item.index),
                curControl = settings.feedbacks.control.eq(item.index),
                errorClass = settings.feedbacks.errorClass,
                successClass = settings.feedbacks.successClass;
            if (result) {
                // 移除错误提示
                curSideMsg.empty();
                curControl.removeClass(errorClass).addClass(successClass);
            } else {
                // 显示错误提示
                curSideMsg.html(msg);
                curControl.removeClass(successClass).addClass(errorClass);
            }
        }

        var resetFeedback = function() {
            var errorClass = settings.feedbacks.errorClass;
            settings.feedbacks.sideMsg.empty();
            settings.feedbacks.bottomMsg.empty();
            settings.feedbacks.control.removeClass(errorClass);
        }


        // 重写serializeArray，有些情况下disabled的表单项也是要提交的，对于不需要的表单项加上ignore属性。
        var rCRLF = /\r?\n/g,
            rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
            rsubmittable = /^(?:input|select|textarea|keygen)/i,
            manipulation_rcheckableType = /^(?:checkbox|radio)$/i;

        jQuery.fn.extend({
            easySerialize: function() {
                return jQuery.param(this.serializeForm());
            },
            serializeForm: function() {
                return this.map(function() {
                        // Can add propHook for "elements" to filter or add form elements
                        var elements = jQuery.prop(this, "elements");
                        return elements ? jQuery.makeArray(elements) : this;
                    })
                    .filter(function() {
                        var type = this.type;
                        // Use .prop('ignore') so that fieldset[ignore] works
                        return this.name && !jQuery(this).prop('ignore') &&
                            rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) &&
                            (this.checked || !manipulation_rcheckableType.test(type));
                    })
                    .map(function(i, elem) {
                        var val = jQuery(this).val();

                        return val == null ?
                            null :
                            jQuery.isArray(val) ?
                            jQuery.map(val, function(val) {
                                return {
                                    name: elem.name,
                                    value: val.replace(rCRLF, "\r\n")
                                };
                            }) : {
                                name: elem.name,
                                value: val.replace(rCRLF, "\r\n")
                            };
                    }).get();
            }
        });
    }
}(jQuery));
