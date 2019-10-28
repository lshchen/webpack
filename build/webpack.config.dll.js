const path = require('path');
const webpack = require('webpack');



module.exports = {
  mode: 'development',
  entry: {
    react: ['react', 'react-dom'],
  },
  output: {
    filename: '[name].dll.js',
    path: path.resolve(__dirname, '../dll'),
    library: '[name].dll.js',
    // libraryTarget: "var" // 设置模式
  },
  plugins: [
    new webpack.DllPlugin({ // name== library 设置动态连接库
      name: '[name].dll.js',
      path: path.resolve(__dirname, '../dll/[name].manifest.json')
    })
  ]
}
