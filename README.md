<div align="center">
<img src="https://raw.githubusercontent.com/hakubox/haku-scroll/master/src/assets/logo.png" >
</div>

# haku-scroll

> vue滚动条组件

## 使用步骤

### 安装

``` bash
npm install haku-scroll --save
```

### 引入

``` javascript
//全局注册
import hakuScroll from 'haku-scroll'
Vue.use(hakuScroll)

//单组件引用
import hakuScroll from 'haku-scroll'
new Vue({
    components: { hakuScroll }
})
```

### 用法

``` html
<haku-scroll>
...
</haku-scroll>
```

### 属性

名称 | 类型 | 默认值 | 描述
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

### 事件

-