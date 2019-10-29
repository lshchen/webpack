const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// 模块happypack可以实现多线程来打包
const Happypack = require('happypack');


module.exports =  {
  entry: './src/index1.js',
  output: {
    filename: 'js/bundle.[hash:8].js',
    path: path.resolve(__dirname,"dist"),
    // publicPath: "./" // 域名
    // chunkFilename: '[name].js' // 代码拆分后的文件名
  },
  module: {
    rules: [
      // {
      //   test: require.resolve('jquery'), //处理第三方模块 内联loader
      //   use: 'expose-loader?$'
      // },
      // {
      //   test: /\.js$/,
      //   include: [path.resolve(__dirname, 'src')], // 指定检查的目录
      //   use: {
      //     loader: 'eslint-loader',
      //     options: {
      //       enforce: 'pre',
      //       fix: true
      //       // formatter: require('eslint-friendly-formatter') // 指定错误报告的格式规范
      //     }
      //   }
      // },
      {
        test: /\.js$/, // 转换es7  npm i @babel/polyfill @babel/runtime
        exclude: /node_modules/,
        //
        use: 'happypack/loader?id=js'
      },
      { // 字体处理
        test: /\.(eot|woff2?|ttf|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name]-[hash:5].min.[ext]',
              limit: 5000, // fonts file size <= 5KB, use 'base64'; else, output svg file
              publicPath: 'fonts/',
              outputPath: 'fonts/'
            }
          }
        ]
      },
      {
        test: /\.html$/,
        use: 'html-withimg-loader'
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name]-[hash:5].min.[ext]',
              limit: 1000, // size <= 1KB
              outputPath: 'images/'
            }
          },
          // img-loader for zip img
          {
            loader: 'image-webpack-loader',
            options: {
              // 压缩 jpg/jpeg 图片
              mozjpeg: {
                progressive: true,
                quality: 65 // 压缩率
              },
              // 压缩 png 图片
              pngquant: {
                quality: '65-90',
                speed: 4
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: '实战',
      filename: 'index.html',
      template: './src/index.html',
      minify: {
        removeAttributeQuote: true, //删除双引号
        collapseWhiteSpace: true // 折叠空行
      }
      // chunks:['home'] //配置多页面
    }),
    new webpack.ProvidePlugin({
      $: 'jquery'
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([{from: './src/static', to: './static'}]),
    new webpack.BannerPlugin('make 2019 by lsc'),
    new webpack.DefinePlugin({ // 定义环境变量
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
    new Happypack({
      id: 'js',
      use: [{
        loader: 'babel-loader'
      }]
    })
  ],
  resolve: { // 解析第三方包common
    extensions: ['.js', '.css', '.json', '.vue']
    // modules: [path.resolve('node_modules')],
    // mainFields: ['style', 'main'], //查找字段
    // mainFiles: [] // 入口文件
    // alias: {
    //   // 别名
    //   // 'bootstrap': 'bootstrap/dist/css/bootstrap.css'
    // }
  },
  resolveLoader: { // 解析loader路径
    modules: ['node_modules',  path.resolve(__dirname, 'loader', 'loader1.js')],
    alias: { //别名
      loader1: path.resolve(__dirname, 'loader', 'loader1.js')
    }
  }
}
