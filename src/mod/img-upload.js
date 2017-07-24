;(function(win, lib) {
    var $ = win['Zepto'];

    function ImgUpload(opts){
        this.defaultOptions = {
            formId: 'img-upload-form',
            targetUrl: 'http://b.taojae.com/service.php',
            auth_name: 'media_auth_key',
            auth_key: '6r4XkF6EcE',
            fileName: 'images',
            trigger: '.upload-file'
        };
        $.extend(this.defaultOptions, opts || {});

        this.init();
    }

    ImgUpload.prototype = {
        init: function () {
            if ($('#' + this.opts.formId).length) {
                return this;
            }
            var $form = $('<form method="post" enctype="multipart/form-data" style="display: none">');
            $form.attr('id', this.opts.formId);
            $form.attr('action', this.opts.targetUrl);

            var $inputKey = $('<input name="' + this.opts.auth_name + '" type="hidden" value="' + this.opts.auth_key + '"/>');
            $inputKey.appendTo($form);

            $form.appendTo('body');
            this.$form = $form;

            // 设置上传file字段
            this.setFileInput();

            // 声明好
            this.ajaxSubmit();
            this.addEvent();

            return this;
        },

        addEvent: function () {
            var that = this;

            $('body').on('click', this.opts.trigger, function () {
                if (that.uploading) {
                    return;
                }
                // 缓存当前按钮
                that.currentTrigger = $(this);
                that.$inputFile.click();
            });
        },

        setFileInput: function () {
            var that = this;
            this.$form.find('input[type=file]').remove();
            this.$form.append('<input type="file" name="' + this.opts.fileName + '" />');

            this.$inputFile = this.$form.find('input[type=file]');
            this.$inputFile.on('change',function () {
                that.$form.submit();
            })
        },
        ajaxSubmit: function () {
            var that = this;
            this.$form.ajaxForm({
                dataType: "json",
                beforeSend: function() {
                    that.uploading = true;
                    that.opts.onUploadStart && that.opts.onUploadStart.call(that);
                },
                uploadProgress: function(event, position, total, percentComplete) {
                    that.opts.onUploadProgress && that.opts.onUploadProgress.call(that, percentComplete);
                },
                success: function(data) {
                    that.opts.onUploadSuccess && that.opts.onUploadSuccess.call(that, data, that.currentTrigger);
                },
                error: function () {
                    // alert('why');
                    that.opts.onUploadError && that.opts.onUploadError.call(that);
                },
                complete: function(xhr) {
                    that.uploading = false;

                    // 重置input file
                    that.setFileInput();
                    that.opts.onUploadComplete && that.opts.onUploadComplete.call(that, xhr);
                }
            });
        }
    };


    lib.imgupload = ImgUpload;
})(window, window['lib'] || (window['lib'] = {}));