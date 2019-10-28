// 测试动态连接库
import react from 'react';
import {render} from 'react-dom';
render('<h1>jsx</h1>', window.root);
/*
*设置多个动态链接库
*const files = fs.readdirSync(path.resolve(__dirname, '../dll'))
*files.forEach(file => {
*  if (/.*\.dll.js/.test(file)) {
*    plugins.push(
*      new AddAssetHtmlWebpackPlugin({
*        filepath: path.resolve(__dirname, '../dll', file)
*      })
*    )
*  }
*  if (/.*\.manifest.json/.test(file)) {
*    plugins.push(
*      new webpack.DllReferencePlugin({
*       manifest: path.resolve(__dirname, '../dll', file)
*    })
*   )
*  }
*})
*
*
* */