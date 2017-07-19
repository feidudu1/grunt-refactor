// 业务：common中views中的jade文件依赖普通grunt时生成的html文件夹

//包装函数
module.exports = function (grunt) {

    //任务配置,所有插件的配置信息
    grunt.initConfig({

        //获取package.json的信息
        pkg: grunt.file.readJSON('package.json'),
        distPath: 'build',
        // 单店
        srcPath: 'src',
        viewPath: 'view',
        assetsPath: 'assets',
        htmlPath: 'html',
        debugPath: 'assets/debug',
        beta: '',

        // 多店
        msrcPath: 'm_src',

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
            }
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
            }
        },

        replace: {
            html: {
                src: ['<%= viewPath %>/*.html'],
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
            }
        },

        copy: {
            releaseHtml: {
                expand: true,
                cwd: 'html',
                src: '**',
                dest: '<%= beta %>/',
            },
            releaseAssets: {
                expand: true,
                cwd: '<%= distPath %>',
                src: '**',
                dest: '<%= beta %>/build/',
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
};
