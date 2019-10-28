const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const merge = require('webpack-merge');
const commonConfig = require('./webpack.base.config.js');
const PurifyCSS = require('purifycss-webpack');
const glob = require('glob-all');
const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 将 css 单独打包成文件
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin'); // 压缩 css
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin');
/*********** 生成雪碧图 ***************/
let spritesConfig = {
  spritePath: './dist/images'
};
let plugins = [
  new MiniCssExtractPlugin({
    filename: 'css/main.css'
  }),
  // new webpack.DefinePlugin({ // 设置动态链接库
  //   manifest: path.resolve(__dirname, '../dist/dll', 'manifest.json')
  // }),
  // new AddAssetHtmlWebpackPlugin({
  //   filepath: path.resolve(__dirname, '../dist/dll/_dll_react.js') // 对应的 dll 文件路径
  // }),
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
];
const files = fs.readdirSync(path.resolve(__dirname, '../dll'));
files.forEach(file => {
  console.log(path.resolve(__dirname, '../dll', file))
  if (/.*\.dll.js/.test(file)) {
    plugins.push(
      new AddAssetHtmlWebpackPlugin({
        filepath: path.resolve(__dirname, '../dll', file),
        outputPath: 'dll',
        publicPath: 'dll',
        includeSourcemap: false
      })
    )
  }
  if (/.*\.manifest.json/.test(file)) {
    plugins.push(
      new webpack.DefinePlugin({
        manifest: path.resolve(__dirname, '../dist/dll', file)
      })
    )
  }
})

const prodConfig = {
  optimization: { //优化项
    minimizer:  [
      new UglifyjsWebpackPlugin({
        cache: true,
        parallel: true, //并发压缩js
        sourceMap: true
      }),
      new OptimizeCssAssetsWebpackPlugin({
        assetNameRegExp: /\.css$/g, //一个正则表达式，指示应优化/最小化的资产的名称。提供的正则表达式针对配置中ExtractTextPlugin实例导出的文件的文件名运行，而不是源CSS文件的文件名。默认为/\.css$/g
        cssProcessor: require('cssnano'), //用于优化\最小化 CSS 的 CSS处理器，默认为 cssnano
        cssProcessorOptions: { safe: true, discardComments: { removeAll: true } }, //传递给 cssProcessor 的选项，默认为{}
        canPrint: true //一个布尔值，指示插件是否可以将消息打印到控制台，默认为 true
      })
    ],
    splitChunks: { // 分割代码块
      chunks: 'all',
      cacheGroups: {
        jquery: {
          name: 'jquery', // 单独将 jquery 拆包
          // minSize: 0,  // 大小
          // minChunks: 2, // 引用次数
          priority: 15, // 权重优先顺序
          test: /[\\/]node_modules[\\/]jquery[\\/]/
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors'
        }
      }
    }
  },
  mode: 'production',
  output: {
    filename: 'js/bundle.[hash:8].js',
    path: path.resolve(__dirname,"../dist"),
    // publicPath: "./" // 域名
  },
  devtool: 'cheap-module-source-map',
  module: {
    noParse: /jquery/, //不去解析jquery模块中依赖
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
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
      } // 抽离css
      // {
      //   test: /\.(sa|sc|c)ss$/,
      //   use: [
      //     {
      //       loader: MiniCssExtractPlugin.loader
      //     },
      //     {
      //       loader: 'css-loader',
      //       options: {
      //         importLoaders: 2 // 在一个 css 中引入了另一个 css，也会执行之前两个 loader，即 postcss-loader 和 sass-loader
      //       }
      //     },
      //     'postcss-loader', // 使用 postcss 为 css 加上浏览器前缀
      //     'sass-loader' // 使用 sass-loader 将 scss 转为 css
      //   ]
      // }
    ]
  },
  plugins: plugins,
  // watch: true, // 监控实时打包
  // watchOptions: {
  //   poll: 1000,
  //   aggregateTimeout: 500, //防抖
  //   ignored: /node_module/ //排除监测
  // },
  // externals: { //不打包第三方模块
  //   jquery: '$'
  // }
}

module.exports = merge(commonConfig, prodConfig);
