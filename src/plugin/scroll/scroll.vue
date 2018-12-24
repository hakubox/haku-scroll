<template>
    <div :class="{
            'vertical': type==='vertical',
            'horizontal': type==='horizontal',
            'hide-btn': hideBtn,
            'scroll-hide': isHide
        }" class="scroll">
        <div class="scroll-bar" tabindex="-1"></div>
        <div class="scroll-rail"></div>
        <i v-show="!hideButton" class="scroll-tool-up fas fa-caret-up" @click="scrollBody.scrollTop = 0"></i>
        <i v-show="!hideButton" class="scroll-tool-down fas fa-caret-down" @click="scrollBody.scrollTop = scrollContent.offsetHeight"></i>
    </div>
</template>

<script>
import liike from 'liike'
import default_mixin from '../mixins'

//局部事件声明
let mouseMoveFn = null,
    verticalBarMouseDown = null,
    documentMouseMove = null,
    documentMouseUp = null,
    railMouseDown = null;

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
            default: 'vertical'
        },
        /**
         * @property {Number} size 滚动条滑块大小
         */
        size: {
            type: Number,
            required: true
        },
        value: {
            type: Number,
            default: 0
        },
        maxValue: {
            type: Number,
            default: 100
        },
        /**
         * @property {Boolean} [hideBtn=true] 是否隐藏按钮
         */
        hideBtn: {
            type: Boolean,
            default: true
        },
        //是否启用平滑移动效果
        anime: {
            type: Boolean,
            default: true
        },
        //单步鼠标滚动距离
        wheelstep: {
            type: Number,
            default: 100
        },
        //单步鼠标滚动时间
        wheeltime: {
            type: Number,
            default: 200
        },
        //滚动时的运动曲线
        wheelseaing: {
            type: String,
            default: 'sineOut'
        },
        //隐藏按钮
        hideButton: {
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
            if(this.type === 'vertical') {
                this.valueOfPixel = (this.scrollRail.offsetHeight - this.scrollBar.offsetHeight) * (newValue / this.maxValue);
                this.scrollBar.style[this.styleName] = 'translateY(' + this.valueOfPixel + 'px)';
            } else if(this.type === 'horizontal') {
                this.valueOfPixel = (this.scrollRail.offsetWidth - this.scrollBar.offsetWidth) * (newValue / this.maxValue);
                this.scrollBar.style[this.styleName] = 'translateX(' + this.valueOfPixel + 'px)';
            }
        },
        size(newValue, oldValue) {
            this.refresh({ size:newValue, maxValue: this.newValue });
        },
        maxValue(newValue, oldValue) {
            this.refresh({ size:this.size, maxValue: newValue });
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
                let _value = (isAdd ? (this.value + value) : value);
                if(_value < 0) {
                    _value = 0;
                } else if (_value > this.maxValue) {
                    _value = this.maxValue;
                }
                this.$emit('update:value', _value);
                this.$emit('scroll', _value);
            }
        },
        /**
         * @method 刷新函数
         */
        refresh(config = {}) {
            let { size, maxValue } = config;
            if (this.type === 'vertical') {
                this.scrollBar.style.height = this.scrollRail.offsetHeight * (size || this.size) / (maxValue || this.maxValue) + 'px';
            } else if(this.type === 'horizontal') {
                this.scrollBar.style.width = this.scrollRail.offsetWidth * (size || this.size) / (maxValue || this.maxValue) + 'px';
            }
        }
    },
    mounted() {
        this.styleName = this.ieVersion == 9 ? 'msTransform' : 'transform';

        this.scroll = this.$el;
        this.scrollBar = this.$el.children[0];
        this.scrollRail = this.$el.children[1];

        //根文档鼠标放开事件
        documentMouseUp = (e) => {
            this.isDrag = false;
        }

        //根文档鼠标移动事件
        documentMouseMove = (e) => {
            //拖拽纵向滚动条
            if(this.isDrag) {
                if(this.type === 'vertical') {
                    this.scrollTo(this.tempValue + (e.pageY - this.tempLocation) * this.maxValue / (this.scrollRail.offsetHeight - this.scrollBar.offsetHeight));
                } else if(this.type === 'horizontal') {
                    this.scrollTo(this.tempValue + (e.pageX - this.tempLocation) * this.maxValue / (this.scrollRail.offsetWidth - this.scrollBar.offsetWidth));
                }
                e.stopPropagation();
                e.preventDefault();
                e.cancelBubble = true;
            }
        }

        //滚动条滑块鼠标按下事件
        verticalBarMouseDown = (e) => {
            if(e.button == 0) {
                this.tempValue = this.value;
                if(this.type === 'vertical') {
                    this.tempLocation = e.pageY;
                } else if(this.type === 'horizontal') {
                    this.tempLocation = e.pageX;
                }
                this.isDrag = true;
                e.stopPropagation();
                e.preventDefault();
            }
        }

        //纵向滚动条底鼠标按下事件
        railMouseDown = (e) => {
            if(e.button == 0) {
                //this.scrollTo(this.maxValue * (e.offsetY / this.scrollRail.offsetHeight));
                console.log(e.offsetY);
                console.dir(this.scrollBar);
                if(e.offsetY < this.valueOfPixel) {
                    this.scrollTo(this.value - this.size);
                } else if(e.offsetY > this.valueOfPixel + this.scrollBar.offsetHeight) {
                    this.scrollTo(this.value + this.size);
                }
                e.stopPropagation();
                e.preventDefault();
            }
        }

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
    $scroll-width: 10px;
    $scroll-bar-padding: 15px;
    $transition: 0.15s;

    .scroll {
        position: relative;
        user-select: none;

        &.vertical {
            height: 100%;
            width: $scroll-width;

            > .scroll-bar {
                width: $scroll-width;
                top: 15px;
            }

            > .scroll-rail {
                width: $scroll-width;
                height: calc(100% - 30px);
                top: 15px;
            }

            > .scroll-tool-start {
                top: 0px;
            }

            > .scroll-tool-end {
                bottom: 0px;
            }

            &.hide-btn {

                > .scroll-bar {
                    top: 0px;
                }

                > .scroll-rail {
                    width: $scroll-width;
                    height: 100%;
                    top: 0px;
                }
            }
        }

        &.horizontal {
            width: 100%;
            height: $scroll-width;

            > .scroll-bar {
                height: $scroll-width;
                left: 15px;
            }

            > .scroll-rail {
                height: $scroll-width;
                width: calc(100% - 30px);
                left: 15px;
            }

            > .scroll-tool-start {
                left: 0px;
            }

            > .scroll-tool-end {
                right: 0px;
            }

            &.hide-btn {

                > .scroll-bar {
                    left: 0px;
                }

                > .scroll-rail {
                    width: 100%;
                    left: 0px;
                }
            }
        }

        &.hide {
            opacity: 0.0;
        }

        > .scroll-bar {
            position: absolute;
            background: #333333;
            border-radius: $scroll-width;
            transition: opacity $transition;
            outline: none !important;
            z-index: 2;
            opacity: 0.6;
        }

        > .scroll-rail {
            position: absolute;
            border-radius: $scroll-width;
            background: #333333;
            z-index: 1;
            opacity: 0.25;
            transition: opacity $transition;
        }

        > .scroll-tool-start {
            cursor: pointer;
            position: absolute;
            font-size: 16px;
            right: $scroll-bar-padding;
            color: #333333;
            transition: opacity $transition;
            opacity: 0.0;
            user-select: none;

            &:hover {
                opacity: 0.6;
            }
        }

        > .scroll-tool-end {
            cursor: pointer;
            position: absolute;
            font-size: 16px;
            right: $scroll-bar-padding;
            color: #333333;
            transition: opacity $transition;
            opacity: 0.0;
            user-select: none;

            &:hover {
                opacity: 0.6;
            }
        }

        &.hide-btn {

            > .scroll-tool-start {
                display: none;
            }

            > .scroll-tool-end {
                display: none;
            }
        }
    }
</style>