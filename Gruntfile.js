// 业务：common中views中的jade文件依赖普通grunt时生成的html文件夹

//包装函数
module.exports = function (grunt) {

    //任务配置,所有插件的配置信息
    grunt.initConfig({

        //获取package.json的信息
        pkg: grunt.file.readJSON('package.json'),
        modulesMap: grunt.file.readJSON('.modulecfg'),
        distPath: 'build',
        // 单店
        srcPath: 'src',
        viewPath: 'view',
        assetsPath: 'assets',
        htmlPath: 'html',
        debugPath: 'assets/debug',
        commonPath: 'app-common',
        commonView: 'views',
        beta: '',

        mainColor: '#ff4b55',

        // 多店
        msrcPath: 'm_src',

        customconcat: {
            options: {
                header: ['src/mod/handle.js','src/mod/deliver.js'],
                footer: []
            },
            main: {
                files: [{
                    expand: true,
                    cwd: '<%= srcPath %>/',
                    src: '*.js',
                    dest: '<%= distPath %>/',
                    ext: '.js',
                    extDot: 'first'
                }],
            }
        },

        //uglify插件的配置信息
        uglify: {
            sim: {
                files: [{
                    expand: true,
                    cwd: '<%= distPath %>',
                    src: ['*.js'],
                    dest: '<%= distPath %>',
                    ext: '.js'
                }]
            },
            mul: {
                files: [{
                    expand: true,
                    cwd: '<%= msrcPath %>',
                    src: ['*.js'],
                    dest: '<%= distPath %>',
                    ext: '.js'
                }]
            },
            common: {
                files: [{
                    expand: true,
                    cwd: '<%= commonPath %>/public/js',
                    src: ['*.js'],
                    dest: '<%= commonPath %>/public/js',
                    ext: '.js'
                }]
            },
        },

        less: {
            sim: {
                files: [{
                    expand: true, // 设为true以下才生效
					cwd: '<%= debugPath %>/',
					src: ['*.less','!_*.less'],
					dest: '<%= distPath %>',
                    ext: '.css'
                }]
            }
        },

        cssmin: {
            sim: {
                files: [{
                    expand: true,
    				cwd: '<%= distPath %>/',
    				src: ['*.css'],
    				dest: '<%= distPath %>/',
                    ext: '.css'
                }]
            }
        },

        clean: {
            sim: {
                src: ['<%= assetsPath %>/debug','<%= distPath %>']
            },
            html: ['<%= htmlPath %>']
        },

        // 将html文件中的html文件转换成jade文件并放到app-common/views中
        html2jade: {
            options: {
                noemptypipe: true,
                donotencode: true
            },
            html: {
                files: [{
                    expand: true,
                    cwd: '<%= htmlPath %>',
                    src: [
                        '*.html'
                    ],
                    dest: '<%= commonPath %>/<%= commonView %>',
                    ext: '.jade'
                }]
            }
        },

        replace: {
            insertModuleList: {
                src: ['<%= viewPath %>/*.html'],
                dest: '<%= htmlPath %>/',
                replacements: [
                    {   // 模块加载替换成script引用<!--//insert-modules: -->
                        from: /\<\!\-\-\/\/insert\-modules:([^\>]+)\-\-\>/g,
                        to: function (matchedWord, index, fullText, regexMatches) {
                            var modulesMap = grunt.config.data.modulesMap;
                            var targetModules = regexMatches[0].split(',');
                            var srcModules = [];
                            targetModules.map(function (v) {
                                srcModules.push(modulesMap[v]);
                            });

                            return '<script src="' + 'http://assets.mockuai.com/min?' + srcModules.join(',') + '"></script>';
                        }
                    }
                ]
            },
            html: {
                src: ['<%= htmlPath %>/*.html'],
                dest: ['<%= htmlPath %>/'],
                replacements: [
                    {
                        from: /@SITENAME/g,
                        to: '<%= cfg.global_config.site_name || "首页" %>'
                    }
                ]
            },
            less: {
                src: ['<%= assetsPath %>/*.less'],
                dest: ['<%= debugPath %>/'],
                replacements: [
                    {
                        from: /@main-color/g,
                        to: '<%= cfg.global_config.colors.main_color %>'
                    }
                ]
            },
            js: {
                src: ['<%= srcPath %>/*.js'],
                dest: '<%= distPath %>/',
                replacements: [
                    {
                        from: /@SITENAME/g,
                        to: '<%= cfg.global_config.site_name || "首页" %>'
                    }
                ]
            },
            debugOnline: {
                src: ['<%= commonPath %>/lib/apps/configInfo.js'],
                overwrite: true,
                replacements: [
                    {
                        from: /var currentEnv.*;/g,
                        to: 'var currentEnv = \'online\';'
                    }
                ]
            },
            debugTest: {
                src: ['<%= commonPath %>/lib/apps/configInfo.js'],
                overwrite: true,
                replacements: [
                    {
                        from: /var currentEnv.*;/g,
                        to: 'var currentEnv = \'test\';'
                    }
                ]
            },
            debugWapa: {
                src: ['<%= commonPath %>/lib/apps/configInfo.js'],
                overwrite: true,
                replacements: [
                    {
                        from: /var currentEnv.*;/g,
                        to: 'var currentEnv = \'wapa\';'
                    }
                ]
            },
            commonJade: {
                src: ['<%= commonPath %>/<%= commonView %>/**/*/.jade'],
                overwrite: true,
                replacements: [
                    {
                        from: /@SITENAME/g,
                        to: '#{api_data.biz_name}'
                    },
                    {
                        from: /body(?![ \{])/,
                        to: "body\n    include ../include/global.jade"
                    },
                ]
            },
            commonLess: {
                src: ['<%= commonPath %>/public/assets/*.less'],
                overwrite: true,
                replacements: [
                    {
                        from: '@import "_var";',
                        to: '@import "_var";\n@main-color: <%= mainColor %>;'
                    }
                ]
            },
            commonJs: {
                src: ['<%= commonPath %>/public/js/*.js'],
                overwrite: true,
                replacements: [
                    {
                        from: /["']@SITENAME['"]/g,
                        to: 'Global.BIZ_NAME'
                    },
                    {
                        from: /['"]@custom_wx_share['"]/g,
                        to: 'Global.CUSTOM_WX_SHARE'
                    }
                ]
            }
        },

        copy: {
            releaseHtml: {
                expand: true,
                cwd: 'html',
                src: '**',
                dest: '<%= beta %>/',
                options: {
                    process: function (content, srcpath) {
                        var version = grunt.config.data.pkg.version;

                        // todo 增加debug版本的部署
                        return content.replace(/\.\.\/data/g, './data')
                            .replace(/\.\.\/build\/([^"\?]+)\??[^"]*/g, './build/$1?v=' + version)
                            .replace(/\.\.\/src/g, './build')
                            .replace(/\.debug\./g, '.');
                    }
                }
            },
            releaseAssets: {
                expand: true,
                cwd: '<%= distPath %>',
                src: '**',
                dest: '<%= beta %>/build/',
            },
            commonLess: {
                files: [{
                    expand: true,
                    cwd: '<%= assetsPath %>',
                    src: ['*.less'],
                    dest: '<%= commonPath %>/public/assets/'
                }]
            },
            commonJs: {
                files: [{
                    expand: true,
                    cwd: '<%= srcPath %>',
                    src: 'mod/*.js',
                    dest: '<%= commonPath %>/public/'
                }, {
                    expand: true,
                    cwd: '<%= distPath %>',
                    src: '*.js',
                    dest: '<%= commonPath %>/public/js/',
                    rename: function (dest, src) {
                        return dest + src.substring(src.lastIndexOf('/') + 1, src.indexOf('.')) + '.js';
                    }
                }]
            }
        }
    });

    //告诉grunt我们将使用插件
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-html2jade');


    // 合并，并且支持添加通用的头尾js文件集
    grunt.registerMultiTask('customconcat','custom concat.', function () {
        var options = this.options({
            header: [],
            footer: [],
            separator: grunt.util.linefeed,
        });
        var headerFiles;
        var footerFiles;
        if (Array.isArray(options.header)) {
            headerFiles = options.header;
        }
        if (Array.isArray(options.footer)) {
            footerFiles = options.footer;
        }

        this.files.forEach(function (f) {
            f.src = [].concat(headerFiles, f.src, footerFiles);
            var src = f.src.filter(function (filepath) {
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file"' + filepath + '" not found.');
                    return false;
                }else {
                    return true;
                }
            });
            if (src.length === 0) {
                grunt.log.warn('Destination(' + f.dest + ') not written because src files were empty.');
                return;
            }
            // 合并操作

        })
    });

    //告诉grunt当我们在终端中输入grunt时需要做些什么(注意先后顺序)
    grunt.registerTask('basic', ['clean','replace','less','copy']);
    grunt.registerTask('prod', ['uglify','cssmin']);
    grunt.registerTask('pub-beta', ['copy']);
    grunt.registerTask('default','start deploy(main entry)', function () {
        var env = grunt.option('env') || 'online';
        var biz = grunt.option('biz');
        var defaultHost = 'm.mockuai.com';
        switch (env) {
            case 'test':
                defaultHost = 'wapatest.m.mockuai.net';
                break;
            case 'wapa':
                defaultHost = 'wapa.m.mockuai.net';
                break;
        }

        var jsonFile = biz ? biz + '_config.json' : 'config.json';  // 指定商城的配置文件（configjson文件夹）
        var betaPath = biz ? 'app-' + biz : defaultHost;   // 指定打包生成的包名，在publish文件夹下面
        grunt.config.set('cfg', grunt.file.readJSON('configjson/' + jsonFile));
        grunt.config.set('beta','publish/' + betaPath);

        var debugApi = '';
        switch (env) {
            // 测试环境
            case 'test':
                debugApi = 'http://10.10.10.13:8090/';
                break;
            // 预发环境
            case 'wapa':
                debugApi = 'http://apiwapa.mockuai.com/';
                break;
        }
        debugApi && grunt.config.set('debugApi',debugApi);

        // 开发环境和生产环境配置
        var developEnv =  typeof grunt.option('dev') != 'undefined';
        if (!developEnv) {
            grunt.task.run(['basic','prod','pub-beta']);  // 生产环境
        }else {
            grunt.task.run(['basic','pub-beta']);   // 开发环境
        }
    });

    // 自动化版本配置 －－－－－－－－－－－－－－－－－－－－－－－－－－－－－－
    grunt.registerTask('moveCommon', ['replace:insertModuleList', 'html2jade', 'customconcat', 'copy:commonJs', 'copy:commonLess']);
    grunt.registerTask('replaceCommon', ['replace:commonJade', 'replace:commonLess', 'replace:commonJs']);

    // 开发环境
    // copy:commonjs 复制 mod 和 .debug.js 到 public 中
    grunt.registerTask('commondev','start app-common build', function () {
        var env = grunt.option('env') || 'online';
        if (env) {
            var upperEnv = env.replace(/(^|\s+)\w/g,function (s) { //正则匹配第一个字，无论该字前是空格还是改字就是第一个字
                return s.toUpperCase();  // 方法的意思是所有字母大写 ，但s是首字母
            });
            var debugTask = 'replace:debug' + upperEnv; // replace:debugOnline
            grunt.task.run([debugTask]);
        }
        grunt.task.run(['moveCommon', 'replaceCommon']);
    });

    // 生产环境
    //
    grunt.registerTask('prodCommon', ['uglify:common']);
    grunt.registerTask('common', ['clean:html', 'replace:debugOnline', 'moveCommon', 'replaceCommon', 'prodCommon']);
};
