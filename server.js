const express = require('express');
const webpack = require('webpack');
// 中间件
const middle = require('webpack-dev-middleware');
let config = require('./dll/webpack.config');
let compiler = webpack(config);
let app = express();
app.use(middle(compiler));

app.get('/user',(req,res)=>{
  res.json({name: 'exc'})
})
app.listen(9000)
