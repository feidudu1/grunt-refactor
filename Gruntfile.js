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
                    expand: true, // 设为true以下才生效？
					cwd: '<%= assetsPath %>',
					src: ['*.less','!_*.less'],
					dest: '<%= assetsPath %>/debug',
                    ext: '.css'
                }]
            }
        },

    });

    //告诉grunt我们将使用插件
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');


    //告诉grunt当我们在终端中输入grunt时需要做些什么(注意先后顺序)
    grunt.registerTask('default',['uglify','less']);
};
