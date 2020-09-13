const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',

  /**
   * 入口文件：
   * 在 examples 目录下，将不同 demo 放到创建的对应的子目录中
   * 子目录中创建 app.ts 作为 webpack 构建的入口文件，同时每个入口还引入了一个用于热更新的文件
   * 相关API使用：
   * > fs.readdirSync 同步读取文件内容，返回包含“指定目录下所有文件名称”的数组对象
   * > fs.statSync 返回 <fs.Stats> 对象
   *      stats.isDirectory() 如果 fs.Stats 对象描述文件系统目录，则返回 true。
   * > fs.existsSync 如果路径存在，则返回 true，否则返回 false。
   * > path.join() 将所有给定的 path 片段连接到一起（使用平台特定的分隔符作为定界符），然后规范化生成的路径。
   */
  entry: fs.readdirSync(__dirname).reduce((entries, dir) => {
    const fullDir = path.join(__dirname, dir);
    const entry = path.join(fullDir, 'app.ts');
    if (fs.statSync(fullDir).isDirectory() && fs.existsSync(entry)) {
      entries[dir] = ['webpack-hot-middleware/client', entry];
    }
    return entries;
  }, {}),

  // 出口文件：根据不同的目录名称，打包生成目标 js，名称和目录名一致
  output: {
    path: path.join(__dirname, '__build__'),
    filename: '[name].js',
    publicPath: '/__build__/',
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: 'pre',
        use: [
          {
            loader: 'tslint-loader',
          },
        ],
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  // resolve 设置模块如何被解析
  resolve: {
    extensions: ['.ts', '.tsx', '.js'], // extensions 自动解析确定的扩展。
  },

  /**
   * plugins 插件：用于以各种方式自定义 webpack 构建过程。
   * > HotModuleReplacementPlugin: 模块热替换插件
   * > NoEmitOnErrorsPlugin: 在编译出现错误时，使用 NoEmitOnErrorsPlugin 来跳过输出阶段。这样可以确保输出资源不会包含错误。对于所有资源，统计资料(stat)的 emitted 标识都是 false。
   */
  plugins: [new webpack.HotModuleReplacementPlugin(), new webpack.NoEmitOnErrorsPlugin()],
};
