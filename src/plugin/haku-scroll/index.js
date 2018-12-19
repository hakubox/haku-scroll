import hakuScroll from './haku-scroll';

// 参考：https://cn.vuejs.org/v2/guide/plugins.html#%E5%BC%80%E5%8F%91%E6%8F%92%E4%BB%B6
hakuScroll.install = Vue => Vue.component(hakuScroll.name, sumFunction);

if (typeof window !== 'undefined' && window.Vue) {
    (function(Vue, opts = {}) {
    　　Vue.component(hakuScroll.name, hakuScroll);
    })(window.Vue);
}

export default hakuScroll;