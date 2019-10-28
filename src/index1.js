import $ from 'jquery';
import logo from './01.jpg'
let str = require('./a.js');
console.log($)
require('./index.css')
console.log(str);
console.log('log');
let fn = () => {
  console.log('fn')
}
fn();
class A{
  a = 1;
  constructor (){
    console.log(this.a)
  }
}
let m = new A();
console.log(m.a);
let img = new Image();
img.src = logo;
document.body.append(img);
// let xhr = new XMLHttpRequest();
// xhr.open('get','api/user',true);
// xhr.onload = function () {
//   console.log(xhr.response)
// };
// xhr.send();
let url = '';
if(dev === 'dev'){
  url = 'development';
} else {
  url = 'production';
}
