<template>
    <div class="block">
        <div class="block-body" :class="dragOrigin">
            <div :class="contentClass" :style="contentStyle" class="block-content">
                <slot></slot>
            </div>
        </div>
        <haku-scroll ref="scrollY" :is-hide="!(vertical && showVertical)" :size="pageHeight" :value.sync="scrollY" @scroll="setScrollY" :max-value="scrollMaxY" class="block-scroll-vertical"></haku-scroll>
    </div>
</template>

<script>
import liike from 'liike'
import hakuScroll from '../scroll/scroll'
import default_mixin from '../mixins'

//局部事件声明
let documentMouseMove = null,
    dragCenterMouseMoveFn = null,
    documentMouseUp = null,
    scrollWheel = null,
    scrollBodyScroll = null,
    scrollMouseDown = null,
    scrollMouseLeave = null;

export default {
    name: 'haku-block',
    components: {
        hakuScroll
    },
    mixins: {
        default_mixin
    },
    props: {
        //内容类样式
        contentClass: {
            type: String,
            default: ''
        },
        //内容样式
        contentStyle: {
            type: String,
            default: ''
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
        //纵向滚动条是否展现
        vertical: {
            type: Boolean,
            default: true
        },
        //横向滚动条是否展现
        horizontal: {
            type: Boolean,
            default: false
        },
        //是否监听子节点树（仅针对IE11及其他现代浏览器，使用可能降低性能）
        watchSubTree: {
            type: Boolean,
            default: false
        },
        //wheel滚动事件延伸至父容器
        parentScroll: {
            type: Boolean,
            default: false
        },
        //隐藏按钮
        hideButton: {
            type: Boolean,
            default: true
        },
        //自动隐藏滚动条
        autoHide: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        y() {
            return this.blockBody.scrollTop;
        }
    },
    data: () => ({
        pageHeight: 0,
        scrollMaxY: 0,
        scrollY: 0,

        block: null,
        blockBody: null,
        blockContent: null,
        elScrollTop: 0,

        showVertical: true,             //显示横向滚动条
        showHorizontal: true,           //显示纵向滚动条
        paddingHeight: 0,               //上下空白的高度
        paddingWidth: 0,                //左右空白的高度
        minBarHeight: 20,               //最小滑块高度
        barSpacing: 15,                 //离边缘距离

        scrollObserver: null,           //IE11及现代浏览器的外框观察器
        scrollContentObserver: null,    //IE11及现代浏览器的内容观察器

        dragOrigin: '',                 //中键点击后滚动
        isContentDrag : false,          //是否开始选中内容
        barTop : 0,                     //当前滑块的位置（像素）
        barLeft : 0,
        scrollBodyTop : 0,              //当前滚动条组件离浏览器头部的距离（临时计算）
        scrollBodyLeft : 0,
        startDragOrigin : false,        //是否开始点击中键滚动
        tempLocation : { x: 0, y: 0 },  //临时用于计算的鼠标点击坐标点
    }),
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
        this.block.removeEventListener('wheel', scrollWheel.bind(this));
        this.blockBody.removeEventListener('scroll', scrollBodyScroll.bind(this));
        this.block.removeEventListener('mousedown', scrollMouseDown.bind(this));
        this.block.removeEventListener('mouseleave', scrollMouseLeave.bind(this));
        //组件销毁
        this.$emit('ondestroy', this);
    },
    methods: {
        scrollMove(target, { x = null, y = null }) {
            if(y) target.scrollTop = y;
            if(x) target.scrollLeft = x;
            this.$emit('scroll', { x, y });
        },
        //拖拽内容
        mouseMoveFn(e) {
            this.scrollBodyTop = this.getScrollTop();

            let _scroll = this.block;
            let locy = e.pageY - this.scrollBodyTop;

            if(locy < 0) {
                this.blockBody.scrollTop += locy / 3;
            } else if(locy > this.block.offsetHeight) {
                this.blockBody.scrollTop += (locy - this.blockBody.offsetHeight - this.paddingHeight) / 3;
            }
            this.$emit('scroll', { x: this.blockBody.scrollLeft, y: this.blockBody.scrollTop });

            setTimeout(() => {
                if(this.isContentDrag &&
                    this.blockBody.scrollTop > 0 &&
                    this.blockBody.scrollTop < this.blockContent.offsetHeight - this.blockBody.offsetHeight) {
                    this.mouseMoveFn(e);
                }
            }, 60);
        },
        setScrollY(value) {
            this.scrollTo({y: value});
        },
        /**
         * @method 滚动到某处
         * @param {Number} [param.x] x坐标
         * @param {Number} [param.y] y坐标
         * @param {Boolean} [param.anime=false] 是否开启平滑滚动
         * @param {Number} [param.delay=0] 延迟时间
         * @param {Number} [param.duration] 滚动时长
         * @param {String} [param.easing='sineOut'] 曲线名称
         */
        scrollTo({x = null, y = null, anime = false, delay = 0, duration = 0, easing = null}) {
            if(!anime) {
                if(x !== null) {
                    this.blockBody.scrollLeft = x;
                    this.elScrollLeft = x;
                }
                if(y !== null) {
                    this.blockBody.scrollTop = y;
                    this.elScrollTop = y;
                }
                this.$emit('scroll', { x, y });
            } else {
                liike(this.scrollMove)(this.blockBody, {
                    delay: delay,
                    duration: duration || this.wheeltime,
                    easing: easing || this.wheelseaing,
                    from: {
                        y: this.blockBody.scrollTop,
                        x: this.blockBody.scrollLeft,
                    },
                    to: {
                        y: y,
                        x: x
                    },
                    onend: () => {
                        if(x) this.elScrollLeft = this.blockBody.scrollLeft;
                        if(y) this.elScrollTop = this.blockBody.scrollTop;
                    }
                });
            }
        },
        /**
         * @method 刷新/重置滚动条基本属性
         */
        refresh(mutationList, observer) {
            this.pageHeight = (this.blockContent.offsetHeight - this.blockBody.offsetHeight) * (this.blockBody.offsetHeight / this.blockContent.offsetHeight);
            this.scrollMaxY = this.blockContent.offsetHeight - this.blockBody.offsetHeight;

            this.$nextTick(() => {
                if(this.vertical) {
                    this.paddingHeight = this.block.offsetHeight - this.blockBody.offsetHeight;
                    this.scrollVerticalBarRatio = this.blockBody.offsetHeight / (this.blockContent.offsetHeight);

                    this.showVertical = this.blockBody.offsetHeight < this.blockContent.offsetHeight;
                }

                if(this.horizontal) {
                    this.paddingWidth = this.block.offsetWidth - this.blockBody.offsetWidth;
                    this.scrollHorizontalBarRatio = this.blockBody.offsetWidth / (this.blockContent.offsetWidth);

                    this.showHorizontal = this.blockBody.offsetWidth < this.blockContent.offsetWidth;
                }

                this.$refs.scrollY.refresh();
            });
        },
        /**
         * @method 获取距离视窗顶部的像素
         */
        getScrollTop() {
            let _el = this.block;
            let result = _el.offsetTop;
            while(_el = _el.parentElement) {
                if(document.defaultView.getComputedStyle(_el,null)['position'] === 'relative') {
                    result += _el.offsetTop - _el.scrollTop;
                }
            }
            result -= document.documentElement.scrollTop;
            return result;
        },
        /**
         * @method 获取距离视窗左边缘的像素
         */
        getScrollLeft() {
            let _el = this.block;
            let result = _el.offsetLeft;
            while(_el = _el.parentElement) {
                if(document.defaultView.getComputedStyle(_el,null)['position'] === 'relative') {
                    result += _el.offsetLeft - _el.scrollLeft;
                }
            }
            result -= document.documentElement.scrollLeft;
            return result;
        }
    },
    computed: {
    },
    mounted() {
        this.block = this.$el;
        this.blockBody = this.$el.children[0];
        this.blockContent = this.blockBody.children[0];

        //根文档鼠标放开事件
        documentMouseUp = (e) => {
            this.isContentDrag = false;

            this.elScrollTop = this.blockBody.scrollTop;
            this.elScrollLeft = this.blockBody.scrollLeft;

            this.blockBody.className = this.blockBody.className.replace(/ (active-vertical|active-horizontal)/g, '');
        }

        let _timer = null;

        //点击中键拖拽事件
        dragCenterMouseMoveFn = (e) => {
            let speedY = 0, speedX = 0;
            //处理上下
            if(this.vertical) {
                if(e.pageY > this.tempLocation.y + 20) {
                    speedY = (e.pageY - this.tempLocation.y - 20) / 2;
                } else if(e.pageY < this.tempLocation.y - 20) {
                    speedY = (e.pageY - this.tempLocation.y + 20) / 2;
                }
                if(speedY) {
                    this.elScrollTop = this.blockBody.scrollTop + speedY;
                    this.blockBody.scrollTop = this.elScrollTop;
                }
            }

            //处理左右
            if(this.horizontal) {
                if(e.pageX > this.tempLocation.x + 20) {
                    speedX = (e.pageX - this.tempLocation.x - 20) / 2;
                } else if(e.pageX < this.tempLocation.x - 20) {
                    speedX = (e.pageX - this.tempLocation.x + 20) / 2;
                }
                if(speedX) {
                    this.elScrollLeft = this.blockBody.scrollLeft + speedX;
                    this.blockBody.scrollLeft = this.elScrollLeft;
                }
            }
            
            this.$emit('scroll', { x: this.blockBody.scrollLeft, y: this.blockBody.scrollTop });

            //处理光标样式
            if(!speedY) {
                if(!speedX) {
                    this.dragOrigin = 'drag-origin';
                } else {
                    this.dragOrigin = 'drag-origin-ew';
                }
            } else {
                if(!this.horizontal) {
                    this.dragOrigin = 'drag-origin-ns';
                } else if(!speedX) {
                    this.dragOrigin = 'drag-origin-ns';
                } else {
                    if(speedY > 0 && speedX > 0 || speedY < 0 && speedX < 0) {
                        this.dragOrigin = 'drag-origin-nw';
                    } else {
                        this.dragOrigin = 'drag-origin-ne';
                    }
                }
            }

            _timer = setTimeout(() => {
                if(this.startDragOrigin) {
                    if(speedY && this.blockBody.scrollTop > 0 && this.blockBody.scrollTop < this.blockContent.offsetHeight - this.blockBody.offsetHeight ||
                       speedX && this.blockBody.scrollLeft > 0 && this.blockBody.scrollLeft < this.blockContent.offsetWidth - this.blockBody.offsetWidth) {
                        dragCenterMouseMoveFn(e);
                    }
                }
            }, 20);
        }

        //根文档鼠标移动事件
        documentMouseMove = (e) => {
            //中键点击滚动
            
            //拖拽内容（跟着滚动滚动条）
            if(this.isContentDrag) {
                this.mouseMoveFn(e);
            } else if(this.startDragOrigin) {
                _timer && window.clearTimeout(_timer);
                dragCenterMouseMoveFn(e);
                e.cancelBubble = true;
            }
        }

        //鼠标滚轮滚动事件
        //linear,quadIn,quadOut,quadInOut,cubicIn,cubicOut,cubicInOut,quartIn,quartOut,quartInOut,quintIn,quintOut,quintInOut,sineIn,sineOut,sineInOut,bounce
        scrollWheel = (e) => {
            if(this.anime && !this.ieVersion) {
                let _elScrollTop = this.elScrollTop;
                if(this.vertical) {
                    let deltaY = e.deltaY && (e.deltaY > 0 ? this.wheelstep : -this.wheelstep);
                    _elScrollTop = Math.min(Math.max(this.elScrollTop + deltaY, 0), this.blockContent.offsetHeight - this.blockBody.offsetHeight);

                    if(e.deltaY > 0) this.elScrollTop = Math.max(this.blockBody.scrollTop, this.elScrollTop);
                    else if(e.deltaY < 0) this.elScrollTop = Math.min(this.blockBody.scrollTop, this.elScrollTop);
                }

                let _elScrollLeft = this.elScrollLeft;
                if(this.horizontal) {
                    let deltaX = e.deltaX && (e.deltaX > 0 ? this.wheelstep : -this.wheelstep);
                    _elScrollLeft = Math.min(Math.max(this.elScrollLeft + deltaX, 0), this.blockContent.offsetWidth - this.blockBody.offsetWidth);

                    if(e.deltaX > 0) this.elScrollLeft = Math.max(this.blockBody.scrollLeft, this.elScrollLeft);
                    else if(e.deltaX < 0) this.elScrollLeft = Math.min(this.blockBody.scrollLeft, this.elScrollLeft);
                }

                liike(this.scrollMove)(this.blockBody, {
                    delay: 0,
                    duration: this.wheeltime,
                    easing: this.wheelseaing,
                    from: {
                        y: this.elScrollTop,
                        x: this.elScrollLeft,
                    },
                    to: {
                        y: _elScrollTop,
                        x: _elScrollLeft
                    }
                });

                if(this.parentScroll && (
                    (e.deltaX == 0 && (e.deltaY < 0 && this.elScrollTop <= 0 || e.deltaY > 0 && this.elScrollTop >= this.blockContent.offsetHeight - this.blockBody.offsetHeight)) ||
                    (e.deltaY == 0 && (e.deltaX < 0 && this.elScrollLeft <= 0 || e.deltaX > 0 && this.elScrollLeft >= this.blockContent.offsetWidth - this.blockBody.offsetWidth))
                )) {
                } else {
                    e.stopPropagation();
                    e.preventDefault();
                }
                this.elScrollTop = _elScrollTop;
                this.elScrollLeft = _elScrollLeft;
            } else {
                if(this.parentScroll && (
                    (e.deltaX == 0 && (e.deltaY < 0 && this.blockBody.scrollTop <= 0 || e.deltaY > 0 && this.blockBody.scrollTop >= this.blockContent.offsetHeight - this.blockBody.offsetHeight)) ||
                    (e.deltaY == 0 && (e.deltaX < 0 && this.blockBody.scrollLeft <= 0 || e.deltaX > 0 && this.blockBody.scrollLeft >= this.blockContent.offsetWidth - this.blockBody.offsetWidth))
                )) {
                } else {
                    e.stopPropagation();
                    e.preventDefault();
                }
                var deltaY = e.deltaY && (e.deltaY > 0 ? this.wheelstep : -this.wheelstep);
                var deltaX = e.deltaX && (e.deltaX > 0 ? this.wheelstep : -this.wheelstep);
                this.blockBody.scrollTop += deltaY;
                this.blockBody.scrollLeft += deltaX;
                this.$emit('scroll', { x: this.blockBody.scrollLeft, y: this.blockBody.scrollTop });
            }
        }

        //scrollBody滚动条滚动事件 scroll
        scrollBodyScroll = (e) => {
            if(this.vertical) {
                this.scrollY = this.blockBody.scrollTop;
            }
            if(this.horizontal) {
                this.barLeft = this.blockBody.scrollLeft / this.blockContent.offsetWidth * this.scrollHorizontalRail.offsetWidth;
                if(!this.ieVersion) {
                    this.scrollHorizontalBar.style.transform = 'translateX(' + this.barLeft + 'px)';
                } else if(this.ieVersion == 9 || this.ieVersion == 10) {
                    this.scrollHorizontalBar.style.msTransform = 'translateX(' + this.barLeft + 'px)';
                }
            }
        }

        //scroll整个组件的鼠标按下事件，可用于中键滚动事件
        scrollMouseDown = (e) => {
            if(e.button === 0) {
                this.isContentDrag = true;
            } else if(e.button === 1) {
                this.tempLocation = { x: e.pageX, y: e.pageY };
                this.dragOrigin = '';
                this.startDragOrigin = !this.startDragOrigin;
                if(!this.startDragOrigin) {
                    _timer = null;
                }
                e.stopPropagation();
                e.preventDefault();
            }
            //this.scroll.className = this.scroll.className.split(' ').concat(['active']).join(' ');
        }

        //光标移出控件的事件
        scrollMouseLeave = (e) => {
            this.startDragOrigin = false;
            this.elScrollTop = this.blockBody.scrollTop;
            this.elScrollLeft = this.blockBody.scrollLeft;
            this.dragOrigin = '';
            _timer = null;
        }

        //纵向滚动条的比例
        this.scrollVerticalBarRatio = this.block.offsetHeight / this.blockContent.offsetHeight;
        //横向滚动条的比例
        this.scrollHorizontalBarRatio = this.block.offsetWidth / this.blockContent.offsetWidth;

        window.addEventListener('resize', () => {
            this.refresh();
        });

        //绑定事件
        document.addEventListener('mouseup', documentMouseUp.bind(this));
        document.addEventListener('mousemove', documentMouseMove.bind(this));
        this.block.addEventListener('wheel', scrollWheel.bind(this));
        this.blockBody.addEventListener('scroll', scrollBodyScroll.bind(this));
        this.block.addEventListener('mousedown', scrollMouseDown.bind(this));
        this.block.addEventListener('mouseleave', scrollMouseLeave.bind(this));

        //初始化
        this.refresh();

        if(!this.ieVersion) {
            this.scrollObserver = new MutationObserver(this.refresh).observe(this.block, {
                attributeFilter: ['class', 'style'],
                childList: false,
                subtree: false
            });
            this.scrollContentObserver = new MutationObserver(this.refresh).observe(this.blockContent, {
                attributeFilter: ['class', 'style'],
                //attributeOldValue: true,
                characterData: true,
                //characterDataOldValue: true,
                childList: true,
                subtree: this.watchSubTree
            });
        } else if(this.ieVersion == 9 || this.ieVersion == 10) {
            this.blockContent.addEventListener('DOMNodeInserted', this.refresh, false);
            this.blockContent.addEventListener('DOMNodeRemoved', this.refresh, false);
            this.blockContent.addEventListener ('DOMAttrModified', this.refresh, false);
        }

        //初始化
        this.$emit('oninit', this);
    }
}
</script>

<style lang="scss" scoped>
    $scroll-width: 10px;
    $scroll-bar-right: 6px;
    $transition: 0.15s;

    .block {
        position: relative;
        overflow: hidden;

        &:hover {

            > .scroll-vertical {
                > .scroll-vertical-bar {
                    opacity: 0.4;
                }

                > .scroll-vertical-rail {
                    opacity: 0.2;
                }

                > .scroll-vertical-tool-up {
                    opacity: 0.4;
                }

                > .scroll-vertical-tool-down {
                    opacity: 0.4;
                }
            }

            > .scroll-horizontal {
                > .scroll-horizontal-bar {
                    opacity: 0.4;
                }

                > .scroll-horizontal-rail {
                    opacity: 0.2;
                }

                > .scroll-horizontal-tool-up {
                    opacity: 0.4;
                }

                > .scroll-horizontal-tool-down {
                    opacity: 0.4;
                }
            }

        }

        > .block-body {
            position: relative;
            height: 100%;
            width: 100%;
            overflow: hidden;

            //原点
            &.drag-origin {
                cursor: all-scroll;
            }
            //竖向滚动
            &.drag-origin-ew {
                cursor: ew-resize;
            }
            //横向滚动
            &.drag-origin-ns {
                cursor: ns-resize;
            }
            //斜向滚动
            &.drag-origin-nw {
                cursor: nw-resize;
            }
            //斜向滚动
            &.drag-origin-ne {
                cursor: ne-resize;
            }

            > .block-content {
                display: inline-block;
                width: 100%;
            }


            &.active-vertical {
                ~ .scroll-vertical {
                    > .scroll-vertical-bar {
                        opacity: 0.6;
                    }
                    > .scroll-vertical-rail {
                        opacity: 0.25;
                    }
                    > .scroll-vertical-tool-up {
                        opacity: 0.25;
                    }
                    > .scroll-vertical-tool-down {
                        opacity: 0.25;
                    }
                }
            }

            &.active-horizontal {
                ~ .scroll-horizontal {
                    > .scroll-horizontal-bar {
                        opacity: 0.6;
                    }
                    > .scroll-horizontal-rail {
                        opacity: 0.25;
                    }
                    > .scroll-horizontal-tool-up {
                        opacity: 0.25;
                    }
                    > .scroll-horizontal-tool-down {
                        opacity: 0.25;
                    }
                }
            }
        }

        &.shadow {
            padding: 0px;

            > .block-body {

                >.block-content {
                    box-shadow: 0px -48px 40px -40px inset rgba(0, 0, 0, 0.1),
                                0px 48px 40px -40px inset rgba(0, 0, 0, 0.1);
                }
            }
        }

        > .block-scroll-vertical {
            transition: $transition;
            position: absolute;
            top: 0px;
            right: 0px;
        }


        > .scroll-horizontal {
            transition: $transition;
        }

        > .scroll-hide {
            opacity: 0.0 !important;
            visibility: hidden !important;
            z-index: -10 !important;
        }
    }
</style>