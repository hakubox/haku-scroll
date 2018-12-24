import block from './block/block';
import scroll from './scroll/scroll';

// 参考：https://cn.vuejs.org/v2/guide/plugins.html#%E5%BC%80%E5%8F%91%E6%8F%92%E4%BB%B6
block.install = Vue => Vue.component(block.name, sumFunction);
scroll.install = Vue => Vue.component(scroll.name, sumFunction);

if (typeof window !== 'undefined' && window.Vue) {
    (function(Vue, opts = {}) {
    　　Vue.component(scroll.name, scroll);
    })(window.Vue);
}

export default {
    block,
    scroll
};