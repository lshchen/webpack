const path = require('path');
const fs = require('fs');
const babylon = require('babylon');
const traverse = require('@babel/traverse').default;
const types = require('@babel/types');
const generator = require('@babel/generator').default;
const ejs = require('ejs');
const tapable = require('tapable');

// babylon 主要就是把源码转换成ast
// @babel/traverse
// @babel/types
// @babel/generator
class Compiler{
  constructor (config) {
    this.config = config;
    // 保存入口文件的路径
    this.entryId

    // 保存所有模块依赖
    this.modules = {}
    this.entry = config.entry; //入口文件路径
    // 工作路径
    this.root = process.cwd();
    this.hooks = {
      entryOption: new SyncHook(),
      compile: new SyncHook(),
      afterCompile: new SyncHook(),
      afterPlugins: new SyncHook(),
      run: new SyncHook(),
      emit: new SyncHook(),
      done: new SyncHook()
    }
    //如果用户传递plugin参数
    let plugins = this.config.plugins;
    if (Array.isArray(plugins)) {
      plugins.forEach(plugin=>{
        plugin.apply(this)
      })
    }
    this.hooks.afterPlugins.call();
  }
  emitFile() {
    // 获得输出目录
    let main = path.join(this.config.output.path,this.config.output.filename);
    // 模板路径
    let templateStr = this.getSource(path.join(__dirname,'main.ejs'));
    let code = ejs.render(templateStr,{entryId: this.entryId, modules: this.modules});
    this.assets = {};
    // 资源中路径对应的代码
    this.assets[main] = code;
    fs.writeFileSync(main,this.assets[main]);
  }
  getSource (path) {
    let rules = this.config.module.rules;
    // 获得loader规则
    for(let i = 0; i < rules.length; i++) {
      let rule = rules[i];
      let {test,use} = rule;
      let len = use.length;
      if(test.test(path)){
        // function loaderNormal () {
        //   let loader = require(use[len--]);
        //   content = loader(content);
        //   if(len >=0) {
        //     loaderNormal()
        //   }
        // }
        // loaderNormal()
      }
    }
    let content = fs.readFileSync(path, 'utf-8');
    return content;
  }
  parse (source, parentPath) { //AST 解析语法树
    console.log(source, parentPath);
    let ast = babylon.parse(source);
    let dependencies = []; //依赖的数组
    traverse(ast, {
      CallExpression(p){
        let node = p.node;
        if(node.callee.name === 'require') {
          node.callee.name = '__webpack_require__';
          let moduleName = node.arguments[0].value; // 取到模块引用的名字
          moduleName = moduleName + (path.extname(moduleName)? '': '.js');
          moduleName = './' + path.join(parentPath,moduleName); //src/a.js
          dependencies.push(moduleName);
          node.arguments = [types.stringLiteral(moduleName)]
        }
      }
    });
    let sourceCode = generator(ast).code;
    return {sourceCode,dependencies}
  }
  buildModule (modulePath, isEntry) {
    let source = this.getSource(modulePath);
    // 模块id modulePth = modulePath - this.root
    let moduleName = './' + path.relative(this.root, modulePath);
    console.log(source, moduleName);
    if (isEntry) {
      this.entryId = moduleName; //保存入口名字
    }
    // 解析需要把source源码进行改造 返回一个依赖列表
    let {sourceCode, dependencies} = this.parse(source,path.dirname(moduleName)); // ./src
    console.log(sourceCode, dependencies);
    this.modules[moduleName] = sourceCode;
    dependencies.forEach(dep=>{ //附属模块的递归加载
      this.buildModule(path.join(this.root,dep),false);
    })
  }
  run () {
    this.hooks.run.call();
    // 执行并创建模块的依赖关系
    this.hooks.compile.call();
    this.buildModule(path.resolve(this.root, this.entry),true);
    this.hooks.afterCompile.call();
    console.log(this.modules, this.entryId);
    // 发送打包文件
    this.emitFile();
    this.hooks.emit.call();
    this.hooks.done.call();
  }
}
module.exports = Compiler