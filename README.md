<div align="center">
<img src="https://raw.githubusercontent.com/hakubox/haku-scroll/master/src/assets/logo.png" >
</div>

# haku-scroll [![Build Status](https://travis-ci.org/hakubox/haku-scroll.svg?branch=master)](https://travis-ci.org/hakubox/haku-scroll) [![](https://img.shields.io/npm/dt/haku-scroll.svg)](https://www.npmjs.com/package/haku-scroll) ![](https://img.shields.io/github/license/hakubox/haku-scroll.svg) ![](https://img.shields.io/badge/IE-%E2%89%A5%209-blue.svg) ![](https://img.shields.io/npm/v/haku-scroll.svg) ![](https://img.shields.io/bundlephobia/min/haku-scroll.svg)

> vue滚动条组件

## 示例图

<div align="center">
<img src="https://raw.githubusercontent.com/hakubox/haku-scroll/master/src/assets/printscreen.png" >
</div>

## 说明

:smiley: 一款定制化滚动条，目前仅兼容PC端，兼容性为IE9+

> :sweat_smile: 因为在代码里会直接调用滚动条元素，所以目前暂时不完全支持修改滚动条的样式，涉及到空间的样式例如height/width/padding等样式需谨慎修改，后期会尽快调整为配置化滚动条。

> 示例具体可参考 [App.vue页面](./src/App.vue)

## 安装

``` bash
npm install haku-scroll --save
```

## 引入

``` javascript
//全局注册组件
import hakuScroll from 'haku-scroll'
Vue.use(hakuScroll)

//单组件引用
import hakuScroll from 'haku-scroll'
new Vue({
    components: { hakuScroll, hakuBlock }
})
```

-----

## 区域 haku-block

### 组件调用

``` html
<haku-block>
...
</haku-block>
```

### 属性

属性名 | 类型 | 默认值 | 描述
---|---|---|---
contentClass | String | - | 内容class样式
contentStyle | String | - | 内容style样式
anime | Boolean | true | 是否启用平滑移动效果
wheelstep | Number | 100 | 单步鼠标滚动距离
wheeltime | Number | 200 | 单步鼠标滚动时间
wheelseaing | String | 'sineOut' | 滚动时的运动曲线，参考 [liike](https://github.com/LiikeJS/Liike)
vertical | Boolean | true | 纵向滚动条是否展现
horizontal | Boolean | false | 横向滚动条是否展现
watchSubTree | Boolean | false | 是否监听子节点树
parentScroll | Boolean | false | wheel滚动事件延伸至父容器
hideButton | Boolean | true | 隐藏按钮

### 函数

函数名 | 参数 | 返回值 | 描述
---|---|---|---
scrollTo | { x:Number,y:Numbere,anime:Boolean,... } | - | 滚动到某处
refresh | config | - | 刷新/重置滚动条基本属性
getScrollTop | - | Number | 获取距离视窗顶部的像素
getScrollLeft | - | Number | 获取距离视窗左边缘的像素

### 事件

事件名 | 返回参数 | 描述
---|---|---
oninit | - | 组件初始化
ondestroy | - | 组件销毁

## 区域 haku-scroll

### 组件调用

``` html
<haku-scroll :value.sync="value" :max-value="maxvalue">
...
</haku-scroll>
```

### 属性

属性名 | 类型 | 默认值 | 描述
---|---|---|---
isHide | Boolean | false | 是否隐藏
type | String | - | 滚动条类型（vertical/horizontal）
min | Number | 0 | 可操作最小值
max | Number | 0 | 可操作最大值（0为不设最大值）
step | Number | 0 | 步长（0为不设步长）
size | Number | - | 滚动条滑块大小
value | Number | 0 | 滚动条滚动的值
maxValue | Number | - | 最大值
minValue | Number | 0 | 最小值
hideBtn | Boolean | true | 隐藏按钮

### 函数

函数名 | 参数 | 返回值 | 描述
---|---|---|---
scrollTo | value, isAdd = false | - | 滚动到某处
refresh | - | - | 刷新/重置滚动条基本属性

### 事件

事件名 | 返回参数 | 描述
---|---|---
oninit | - | 组件初始化
ondestroy | - | 组件销毁

## 未完成功能

- [x] 基本功能
- [x] 变化监听
- [x] 鼠标中键滚动
- [x] 自定义滚动条样式
- [ ] 自动隐藏
- [x] 滚动限制
- [ ] 滚动事件钩子
- [ ] 扩展至移动端
- [ ] 拆分为独立js组件
