#! /usr/bin/env node

// npm link 连接

//1、需要找到当前执行名的路径、拿到webpack.config.js
const path = require('path');
//config配置文件
let config = require(path.resolve('webpack.config.js'));

// 2、引入编译类
const Compiler = require('../lib/Compiler');
let compiler = new Compiler(config);
compiler.hooks.entryOption.call();
//运行编译
compiler.run();