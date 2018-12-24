<template>
    <div :class="{
            'vertical': type==='vertical',
            'horizontal': type==='horizontal',
            'hide-btn': hideBtn,
            'scroll-hide': isHide
        }" class="haku-scroll">
        <div class="haku-scroll-bar" tabindex="-1"></div>
        <div class="haku-scroll-rail"></div>
        <i class="haku-scroll-tool-up fas fa-caret-up" @click="scrollBody.scrollTop = 0"></i>
        <i class="haku-scroll-tool-down fas fa-caret-down" @click="scrollBody.scrollTop = scrollContent.offsetHeight"></i>
    </div>
</template>

<script>
import liike from 'liike'
import default_mixin from '../mixins'

//局部事件声明
//根文档鼠标放开事件
function documentMouseUp(e) {
    this.isDrag = false;
    this.scroll.className = this.scroll.className.replace(/ active/g, '');
}

//根文档鼠标移动事件
function documentMouseMove(e) {
    //拖拽纵向滚动条
    if(this.isDrag) {
        if(this.type === 'vertical') {
            this.scrollTo(this.tempValue + (e.pageY - this.tempLocation) * (this.maxValue - this.minValue) / (this.scrollRail.offsetHeight - this.scrollBar.offsetHeight));
        } else if(this.type === 'horizontal') {
            this.scrollTo(this.tempValue + (e.pageX - this.tempLocation) * (this.maxValue - this.minValue) / (this.scrollRail.offsetWidth - this.scrollBar.offsetWidth));
        }
        e.stopPropagation();
        e.preventDefault();
    }
}

//滑块鼠标按下事件
function verticalBarMouseDown(e) {
    if(e.button == 0) {
        this.tempValue = this.value;
        if(this.type === 'vertical') {
            this.tempLocation = e.pageY;
        } else if(this.type === 'horizontal') {
            this.tempLocation = e.pageX;
        }
        this.scroll.className = this.scroll.className.split(' ').concat(['active']).join(' ');
        this.isDrag = true;
        e.stopPropagation();
        e.preventDefault();
    }
}

//鼠标按下事件
function railMouseDown(e) {
    if(e.button == 0) {
        //this.scrollTo(this.maxValue * (e.offsetY / this.scrollRail.offsetHeight));
        if(this.type == 'vertical') {
            if(e.offsetY < this.valueOfPixel) {
                this.scrollTo(this.value - this.size);
            } else if(e.offsetY > this.valueOfPixel + this.scrollBar.offsetHeight) {
                this.scrollTo(this.value + this.size);
            }
        } else if(this.type == 'horizontal') {
            if(e.offsetY < this.valueOfPixel) {
                this.scrollTo(this.value - this.size);
            } else if(e.offsetY > this.valueOfPixel + this.scrollBar.offsetHeight) {
                this.scrollTo(this.value + this.size);
            }
        }
        e.stopPropagation();
        e.preventDefault();
    }
}

export default {
    name: 'haku-scroll',
    components: {

    },
    mixins: {
        default_mixin
    },
    props: {
        /**
         * @property {Boolean} [isHide=true] 是否显示
         */
        isHide: {
            type: Boolean,
            default: false
        },
        /**
         * @property {String} [type='vertical'] 滚动条类型（vertical/horizontal）
         */
        type: {
            type: String,
            validator(value) {
                return ['vertical', 'horizontal', 'danger'].indexOf(value) !== -1
            },
            default: 'vertical'
        },
        /**
         * @property {Number} [min=0] 可操作最小值
         */
        min: {
            type: Number,
            default: 0
        },
        /**
         * @property {Number} [max=0] 可操作最大值（0为不设最大值）
         */
        max: {
            type: Number,
            default: 0
        },
        /**
         * @property {Number} [step=0] 步长（0为不设步长）
         */
        step: {
            type: Number,
            default: 0
        },
        /**
         * @property {Number} size 滚动条滑块大小
         */
        size: {
            type: Number,
            required: true
        },
        /**
         * @property {Number} barMinSize 最小滚动条滑块大小（像素），一般情况下不需要手动传入
         */
        barMinSize: {
            type: Number,
            default: 30
        },
        /**
         * @property {Number} value 滚动条滚动的值
         */
        value: {
            type: Number,
            default: 0
        },
        /**
         * @property {Number} maxValue 最大值
         */
        maxValue: {
            type: Number,
            required: true
        },
        /**
         * @property {Number} minValue 最小值
         */
        minValue: {
            type: Number,
            default: 0
        },
        /**
         * @property {Boolean} [hideBtn=true] 是否隐藏按钮
         */
        hideBtn: {
            type: Boolean,
            default: true
        }
    },
    data: () => ({
        scroll: null,
        scrollObserver: null,           //IE11及现代浏览器的外框观察器
        scrollContentObserver: null,    //IE11及现代浏览器的内容观察器
        isDrag : false,                 //是否开始拖拽纵向滚动条
        tempLocation : 0,               //临时用于计算的鼠标点击坐标点
        tempValue: 0,
        valueOfPixel: 0,
        styleName: ''
    }),
    watch: {
        value(newValue, oldValue) {
            this.setLocation();
        },
        size(newValue, oldValue) {
            this.refresh();
        },
        maxValue(newValue, oldValue) {
            this.refresh();
        }
    },
    destroyed() {
        if(this.scrollObserver) {
            this.scrollObserver.takeRecords();
            this.scrollObserver.disconnect();
        }
        if(this.scrollContentObserver) {
            this.scrollContentObserver.takeRecords();
            this.scrollContentObserver.disconnect();
        }

        document.removeEventListener('mouseup', documentMouseUp.bind(this));
        document.removeEventListener('mousemove', documentMouseMove.bind(this));
        this.scrollBar.removeEventListener('mousedown', verticalBarMouseDown.bind(this));
        this.scrollRail.removeEventListener('mousedown', railMouseDown.bind(this));
        //组件销毁
        this.$emit('ondestroy', this);
    },
    methods: {
        scrollTo(value, isAdd = false) {
            if(value) {
                let _value = isAdd ? (this.value + value) : value;
                if(_value < this.minValue) {
                    _value = this.minValue;
                } else if (_value > this.maxValue) {
                    _value = this.maxValue;
                }
                if(this.min) _value = Math.max(_value, this.min);
                if(this.max) _value = Math.min(_value, this.max);
                if(this.step) _value = _value - _value % this.step;
                this.$emit('update:value', _value);
                this.$emit('scroll', _value);
            }
        },
        /**
         * @method 刷新函数
         */
        refresh() {
            if (this.type === 'vertical') {
                let _height = this.scrollRail.offsetHeight * this.size / (this.maxValue - this.minValue);
                this.scrollBar.style.height = (_height < this.barMinSize ? this.barMinSize : _height) + 'px';
            } else if(this.type === 'horizontal') {
                let _width = this.scrollRail.offsetWidth * this.size / (this.maxValue - this.minValue);
                this.scrollBar.style.width = (_width < this.barMinSize ? this.barMinSize : _width) + 'px';
            }
            this.setLocation();
        },
        setLocation() {
            if(this.type === 'vertical') {
                this.valueOfPixel = (this.scrollRail.offsetHeight - this.scrollBar.offsetHeight) * ((this.value - this.minValue) / (this.maxValue - this.minValue));
                this.scrollBar.style[this.styleName] = 'translateY(' + this.valueOfPixel + 'px)';
            } else if(this.type === 'horizontal') {
                this.valueOfPixel = (this.scrollRail.offsetWidth - this.scrollBar.offsetWidth) * ((this.value - this.minValue) / (this.maxValue - this.minValue));
                this.scrollBar.style[this.styleName] = 'translateX(' + this.valueOfPixel + 'px)';
            }
        }
    },
    mounted() {
        this.styleName = this.ieVersion == 9 ? 'msTransform' : 'transform';

        this.scroll = this.$el;
        this.scrollBar = this.$el.children[0];
        this.scrollRail = this.$el.children[1];

        //绑定事件
        document.addEventListener('mouseup', documentMouseUp.bind(this));
        document.addEventListener('mousemove', documentMouseMove.bind(this));
        this.scrollBar.addEventListener('mousedown', verticalBarMouseDown.bind(this));
        this.scrollRail.addEventListener('mousedown', railMouseDown.bind(this));

        this.refresh();

        if(!this.ieVersion) {
            this.scrollObserver = new MutationObserver(this.refresh).observe(this.scroll, {
                attributeFilter: ['class', 'style'],
                childList: false,
                subtree: false
            });
        } else if(ieVersion == 9 || ieVersion == 10) {
            this.scroll.addEventListener('DOMNodeInserted', this.refresh, false);
            this.scroll.addEventListener('DOMNodeRemoved', this.refresh, false);
            this.scroll.addEventListener ('DOMAttrModified', this.refresh, false);
        }

        //初始化
        this.$emit('oninit', this);
    }
}
</script>

<style lang="scss" scoped>
</style>