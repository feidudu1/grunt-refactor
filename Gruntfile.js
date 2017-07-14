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


        // 多店
        msrcPath: 'm_src',

        //uglify插件的配置信息
        uglify: {
            sim: {
                files: [{
                    expand: true,
                    cwd: '<%= srcPath %>',
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
        }

    });

    //告诉grunt我们将使用插件
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-text-replace');

    //告诉grunt当我们在终端中输入grunt时需要做些什么(注意先后顺序)
    grunt.registerTask('sim', ['clean','uglify','replace','less','cssmin']);
    grunt.registerTask('default','start deploy(main entry)', function () {
        var biz = grunt.option('biz');
        var jsonFile = biz ? biz + '_config.json' : 'config.json';  // 指定商城的配置文件（configjson文件夹）
        var beta = biz ? 'app-' + biz : 'm.mockuai.com';   // 指定打包生成的包名，在publish文件夹下面
        grunt.config.set('cfg', grunt.file.readJSON('configjson/' + jsonFile));
        grunt.config.set('betaPath','publish/' + beta);
        grunt.task.run(['sim']);
    });
};
