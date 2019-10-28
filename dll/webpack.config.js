const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin');
const PurifyCSS = require('purifycss-webpack');
const glob = require('glob-all');
/*********** 生成雪碧图 ***************/
let spritesConfig = {
  spritePath: './dist/images'
}
module.exports = {
  // watch: true, // 监控实时打包
  // watchOptions: {
  //   poll: 1000,
  //   aggregateTimeout: 500, //防抖
  //   ignored: /node_module/ //排除监测
  // },
  devtool: 'source-map',  // 增加映射文件帮助调试源代码、eval-source-map不会产生单独文件、cheap-module-source-map不会产生列但会生成文件、cheap-module-eval-source-map不会生成文件集成在打包文件中也不会产生列
  optimization: { //优化项
    minimizer:  [
      new UglifyjsWebpackPlugin({
        cache: true,
        parallel: true, //并发压缩js
        sourceMap: true
      }),
      new OptimizeCssAssetsWebpackPlugin()
    ]
  },
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'js/bundle.[hash:8].js',
    path: path.resolve(__dirname,"dist"),
    // publicPath: "./" // 域名
  },
  devServer: {
    port: 3000,
    progress: true,
    contentBase: './dist',
    open: true
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
  module:{
    noParse: /jquery/, //不去解析jquery模块中依赖
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
        // {test: /\.css$/,use: [{loader: 'style-loader', options: {insertAt: 'top'}}, 'css-loader']} // 默认执行顺序从右向左
      {
        test: /\.css$/,
        use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: [require('postcss-sprites')(spritesConfig)]
              }
            }
        ]
      }, // 抽离css
      {
        test: /\.js$/, // 转换es7  npm i @babel/polyfill @babel/runtime
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.(pgn|jpg|gif)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 1*1024,
            outputPath: 'images/'
          }
        }
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
      }
    ]
  },
  plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html',
        minify: {
          removeAttributeQuote: true, //删除双引号
          collapseWhiteSpace: true // 折叠空行
        }
        // chunks:['home'] //配置多页面
      }),
      new MiniCssExtractPlugin({
        filename: 'css/main.css'
      }),
      new webpack.ProvidePlugin({
        $: 'jquery'
      }),
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin([{from: './src/static', to: './static'}]),
      new webpack.BannerPlugin('make 2019 by lsc'),
      new webpack.DefinePlugin({ // 定义环境变量
        DEV: JSON.stringify('dev')
      }),
      new webpack.DefinePlugin({ // 设置动态链接库
        manifest: path.resolve(__dirname, 'dist/dll', 'manifest.json')
      }),
      new AddAssetHtmlWebpackPlugin({
        filepath: path.resolve(__dirname, './dll/_dll_react.js') // 对应的 dll 文件路径
      }),
      // 清除无用 css
      new PurifyCSS({
        paths: glob.sync([
          // 要做 CSS Tree Shaking 的路径文件
          path.resolve(__dirname, './*.html'), // 请注意，我们同样需要对 html 文件进行 tree shaking
          path.resolve(__dirname, './src/*.js')
        ])
      }),
      new webpack.IgnorePlugin(/\.\/locale/, /moment/) //忽略加载文件
      // moment 格式化时间的插件
  ],
  // externals: { //不打包第三方模块
  //   jquery: '$'
  // }
  resolve: { // 解析第三方包common
    extensions: ['.js', '.css', '.json', '.vue']
    // modules: [path.resolve('node_modules')],
    // mainFields: ['style', 'main'], //查找字段
    // mainFiles: [] // 入口文件
    // alias: {
    //   // 别名
    //   // 'bootstrap': 'bootstrap/dist/css/bootstrap.css'
    // }
  }
}