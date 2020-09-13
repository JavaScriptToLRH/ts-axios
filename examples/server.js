const express = require('express');
// body-parser 是一个HTTP请求体解析中间件，使用这个模块可以解析JSON、Raw、文本、URL-encoded格式的请求体
const bodyParser = require('body-parser');
// cookie-parser 用来实现cookie的解析
const cookieParser = require('cookie-parser');
// connect-multiparty 实现文件上传(文件接收)
const multipart = require('connect-multiparty');
// atob 对字符串进行 base64 转换和解析
const atob = require('atob');
const webpack = require('webpack');
// webpack-dev-middleware 生成一个与 webpack 的 compiler 绑定的中间件，然后在 express 启动的服务 app 中调用这个中间件。
// 中间件作用如下：
// > 通过watch mode，监听资源的变更，自动打包（如何实现，见下文详解)
// > 快速编译，走内存
// > 返回中间件，支持express的use格式。
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const WebpackConfig = require('./webpack.config');
const path = require('path');

require('./server2');

const app = express();
const compiler = webpack(WebpackConfig);

app.use(
  webpackDevMiddleware(compiler, {
    publicPath: '/__build__/', // 绑定中间件的公共路径
    stats: { //  用于形成统计信息的选项
      colors: true,
      chunks: false,
    },
  }),
);

app.use(webpackHotMiddleware(compiler));

app.use(
  // 提供对静态资源文件(图片、csss文件、javascript文件)的服务
  // 传递一个包含静态资源的目录给 express.static 中间件用于立刻开始提供文件
  express.static(__dirname, {
    setHeaders(res) {
      res.cookie('XSRF-TOKEN-D', '1234abc');
    },
  }),
);

app.use(bodyParser.json()); // 解析JSON格式
// app.use(bodyParser.text())
app.use(bodyParser.urlencoded({ extended: true })); // 解析文本格式
app.use(cookieParser());

app.use(
  multipart({
    uploadDir: path.resolve(__dirname, 'upload-file'),
  }),
);

const router = express.Router();

registerSimpleRouter();

registerBaseRouter();

registerErrorRouter();

registerExtendRouter();

registerInterceptorRouter();

registerConfigRouter();

registerCancelRouter();

registerMoreRouter();

app.use(router);

const port = process.env.PORT || 8080;
module.exports = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}, Ctrl+C to stop`);
});

function registerSimpleRouter() {
  router.get('/simple/get', function(req, res) {
    res.json({
      msg: `hello world`,
    });
  });
}

function registerBaseRouter() {
  router.get('/base/get', function(req, res) {
    res.json(req.query);
  });

  router.post('/base/post', function(req, res) {
    res.json(req.body);
  });

  router.post('/base/buffer', function(req, res) {
    let msg = [];
    req.on('data', chunk => {
      if (chunk) {
        msg.push(chunk);
      }
    });
    req.on('end', () => {
      let buf = Buffer.concat(msg);
      res.json(buf.toJSON());
    });
  });
}

function registerErrorRouter() {
  router.get('/error/get', function(req, res) {
    if (Math.random() > 0.5) {
      res.json({
        msg: `hello world`,
      });
    } else {
      res.status(500);
      res.end();
    }
  });

  router.get('/error/timeout', function(req, res) {
    setTimeout(() => {
      res.json({
        msg: `hello world`,
      });
    }, 3000);
  });
}

function registerExtendRouter() {
  router.get('/extend/get', function(req, res) {
    res.json({
      msg: 'hello world',
    });
  });

  router.options('/extend/options', function(req, res) {
    res.end();
  });

  router.delete('/extend/delete', function(req, res) {
    res.end();
  });

  router.head('/extend/head', function(req, res) {
    res.end();
  });

  router.post('/extend/post', function(req, res) {
    res.json(req.body);
  });

  router.put('/extend/put', function(req, res) {
    res.json(req.body);
  });

  router.patch('/extend/patch', function(req, res) {
    res.json(req.body);
  });

  router.get('/extend/user', function(req, res) {
    res.json({
      code: 0,
      message: 'ok',
      result: {
        name: 'jack',
        age: 18,
      },
    });
  });
}

function registerInterceptorRouter() {
  router.get('/interceptor/get', function(req, res) {
    res.end('hello');
  });
}

function registerConfigRouter() {
  router.post('/config/post', function(req, res) {
    res.json(req.body);
  });
}

function registerCancelRouter() {
  router.get('/cancel/get', function(req, res) {
    setTimeout(() => {
      res.json('hello');
    }, 1000);
  });

  router.post('/cancel/post', function(req, res) {
    setTimeout(() => {
      res.json(req.body);
    }, 1000);
  });
}

function registerMoreRouter() {
  router.get('/more/get', function(req, res) {
    res.json(req.cookies);
  });

  router.post('/more/upload', function(req, res) {
    console.log(req.body, req.files);
    res.end('upload success!');
  });

  router.post('/more/post', function(req, res) {
    const auth = req.headers.authorization;
    const [type, credentials] = auth.split(' ');
    console.log(atob(credentials));
    const [username, password] = atob(credentials).split(':');
    if (type === 'Basic' && username === 'Yee' && password === '123456') {
      res.json(req.body);
    } else {
      res.status(401);
      res.end('UnAuthorization');
    }
  });

  router.get('/more/304', function(req, res) {
    res.status(304);
    res.end();
  });

  router.get('/more/A', function(req, res) {
    res.end('A');
  });

  router.get('/more/B', function(req, res) {
    res.end('B');
  });
}
