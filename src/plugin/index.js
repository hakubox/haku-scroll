import HakuBlock from './block/block';
import HakuScroll from './scroll/scroll';
import '../assets/scss/common.scss';

const components = [
    HakuBlock,
    HakuScroll
];

const install = function(Vue, opts = {}) {
    components.forEach(component => {
        Vue.component(component.name, component);
    });
};

if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}

export default {
    install,
    HakuBlock,
    HakuScroll
};
