const path = require('path');
const webpack = require('webpack')
const merge = require('webpack-merge')
const commonConfig = require('./webpack.base.config.js')

const devConfig = {
  mode: 'development',
  output: {
    filename: 'js/bundle.[hash:8].js',
    path: path.resolve(__dirname,"../dist"),
    // publicPath: "./" // 域名
  },
  module: {
    rules: [
      // {test: /\.(sa|sc|c)ss$/,use: [{loader: 'style-loader', options: {insertAt: 'top'}}, 'css-loader']} // 默认执行顺序从右向左
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2 // 在一个 css 中引入了另一个 css，也会执行之前两个 loader，即 postcss-loader 和 sass-loader
            }
          },
          'postcss-loader', // 使用 postcss 为 css 加上浏览器前缀
          // 'sass-loader' // 使用 sass-loader 将 scss 转为 css
        ]
      }
    ]
  },
  devtool: 'source-map',
  devServer: {
    hot: true,
    port: 8080,
    progress: true,
    contentBase: './dist',
    open: true,
    historyApiFallback: true
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:9000',
    //     pathRewrite: {'/api': ''}
    //   }
    // }
    // 2、模拟数据
    // before(app){
    //   app.get('/user',(req,res)=>{
    //     res.json({name: 'lsc'})
    //   })
    // }
    // 3、有服务器不用代理来处理、能不能再服务端启动webpack端口用服务端的server.js
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedChunksPlugin()
  ]
}

module.exports = merge(commonConfig, devConfig);
