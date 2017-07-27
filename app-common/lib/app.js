var express = require('express'),
	favicon = require('serve-favicon'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	morgan = require('morgan'),
	methodOverride = require('method-override'),
	errorHandler = require('errorhandler'),
	pathModule = require('path'),
	routes = require('./routes/index'),
	formidable = require('formidable'),
	compression = require('compression'),
	lessMiddleware = require('less-middleware'),
	Utils = require('./tools/utils'),
	cache = require('memory-cache');

var config = Utils.getJSONSync('config.json'),
    app = express();

app.set('port',config.port);
app.set('views',pathModule.join(__dirname,'..','views'));  // 返回/grunt-refactor/app-common/views
app.set('view engine', 'jade');

// less编译
app.use(lessMiddleware(pathModule.join(__dirname,'..','public')));
app.use(express.static(pathModule.join(__dirname,'..','public')));

//中间件
app.use(compression());
app.use(favicon(pathModule.join(__firname,'..','public','favicon.ico')));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended': false, 'limit': 512000}));
app.use(bodyParser.json({'limit': 512000}));
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
    secret: '6b1b36cbb04b41490bfc0ab2bfa26f86',
	resave: true,
	saveUninitialized: true
}));
app.use(express.query());

routes.bind(app);

// 生产环境下的错误处理
// 不会向用户显示堆栈信息
app.use(function(err, req, res, next) {
	// 设置响应状态
	res.status(err.status || 500);
	// 渲染错误处理页
	res.send(err.status || 500 + ': 网络出错了!');
});

app.listen(app.get('port'),function () {
    console.log('express h5 service run at ' + app.get('env') + 'listening on port' + app.get('port'));
})
