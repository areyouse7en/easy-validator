'use strict';

$(function() {

    var form1 = $('#form1');
    var form2 = $('#form2');

    form1.validate({
        rules: {
            inputUname1: {
                required: true,
                isEnglish: true,
                range: {
                    min: 4,
                    max: 16
                }
            },
            inputPassword1: {
                required: true
            }
        },
        messages: {
            inputUname1: {
                required: '用户名不能为空！',
                isEnglish: '必须为全英文!',
                range: '4到16位字母'
            },
            inputPassword1: {
                required: '密码不能为空！'
            }
        },
        ajaxPost: {
            method: 'get',
            success: function(res) {
                $('.bottom-msg', form1).html(res.msg);
            },
            error: function(res) {
                alert('error');
            }
        }
    });

    form2.validate({
        rules: {
            inputUname2: {
                required: true,
                isEnglish: true,
                range: {
                    min: 4,
                    max: 16
                }
            },
            inputPassword2: {
                required: true
            },
            inputPassword2R: {
                required: true,
                equalTo: 'inputPassword2'
            }
        },
        messages: {
            inputUname2: {
                required: '用户名不能为空！',
                isEnglish: '必须为全英文!',
                range: '4到16位字母'
            },
            inputPassword2: {
                required: '密码不能为空！'
            },
            inputPassword2R: {
                required: '密码不能为空！',
                equalTo: '两次密码不一致'
            }
        },
        checkOnBlur: false,
        ajaxPost: {
            method: 'get',
            ignore: ['inputPassword2R'],
            success: function(res) {
                $('.bottom-msg', form2).html(res.msg);
            },
            error: function(res) {
                alert('error');
            }
        }
    });

});
