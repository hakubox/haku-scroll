<template>
    <div class="scroll">
        <div class="scroll-body" :class="dragOrigin">
            <div :class="contentClass" :style="contentStyle" class="scroll-content">
                <slot></slot>
            </div>
        </div>
        <div :class="{'scroll-hide': !(vertical && showVertical)}" class="scroll-vertical">
            <div class="scroll-vertical-bar" tabindex="-1"></div>
            <div class="scroll-vertical-rail"></div>
            <i v-show="!hideButton" class="scroll-vertical-tool-up fas fa-caret-up" @click="scrollBody.scrollTop = 0"></i>
            <i v-show="!hideButton" class="scroll-vertical-tool-down fas fa-caret-down" @click="scrollBody.scrollTop = scrollContent.offsetHeight"></i>
        </div>
        <div :class="{'scroll-hide': !(horizontal && showHorizontal)}" class="scroll-horizontal">
            <div class="scroll-horizontal-bar" tabindex="-1"></div>
            <div class="scroll-horizontal-rail"></div>
            <i v-show="!hideButton" class="scroll-horizontal-tool-up fas fa-caret-left" @click="scrollBody.scrollLeft = 0"></i>
            <i v-show="!hideButton" class="scroll-horizontal-tool-down fas fa-caret-right" @click="scrollBody.scrollLeft = scrollContent.offsetHeight"></i>
        </div>
    </div>
</template>

<script>
import liike from 'liike';

const scrollMove = (target, { x = null, y = null }) => {
    if(y) target.scrollTop = y;
    if(x) target.scrollLeft = x;
};

let ieVersion = 0;

//局部事件声明
let documentMouseMove = null,
    mouseMoveFn = null,
    dragCenterMouseMoveFn = null,
    documentMouseUp = null,
    scrollWheel = null,
    verticalBarMouseDown = null,
    verticalRailMouseDown = null,
    horizontalBarMouseDown = null,
    horizontalRailMouseDown = null,
    scrollBodyScroll = null,
    scrollMouseDown = null,
    scrollMouseLeave = null;

export default {
    name: 'zx-scroll',
    components: {

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
            default: true
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
            return this.scrollBody.scrollTop;
        }
    },
    data: () => ({
        scroll: null,
        scrollBody: null,
        scrollContent: null,

        showVertical: true,             //显示横向滚动条
        showHorizontal: true,           //显示纵向滚动条
        paddingHeight: 0,               //上下空白的高度

        scrollVerticalBar: null,
        scrollVerticalRail: null,
        scrollVerticalBarRatio: 0,      //横向滚动条的比例

        paddingWidth: 0,                //左右空白的高度
        scrollHorizontalBar: null,
        scrollHorizontalRail: null,
        scrollHorizontalBarRatio: 0,    //纵向滚动条的比例

        barHeight: 0,                   //纵向滑块的高度
        barWidth: 0,                    //横向滑块的宽度
        minBarHeight: 20,               //最小滑块高度
        barSpacing: 15,                 //离边缘距离

        scrollObserver: null,           //IE11及现代浏览器的外框观察器
        scrollContentObserver: null,    //IE11及现代浏览器的内容观察器

        dragOrigin: '',                 //中键点击后滚动

        isVerticalBarDrag : false,      //是否开始拖拽纵向滚动条
        isHorizontalBarDrag : false,    //是否开始拖拽纵向滚动条
        isContentDrag : false,          //是否开始选中内容
        barTop : 0,                     //当前滑块的位置（像素）
        barLeft : 0,
        scrollBodyTop : 0,              //当前滚动条组件离浏览器头部的距离（临时计算）
        scrollBodyLeft : 0,
        startDragOrigin : false,        //是否开始点击中键滚动
        tempLocation : { x: 0, y: 0 },  //临时用于计算的鼠标点击坐标点
        elScrollTop : 0,                //wheel时临时计算的滚动条滚动距离
        elScrollLeft : 0
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
        this.scroll.removeEventListener('wheel', scrollWheel.bind(this));
        this.scrollVerticalBar.removeEventListener('mousedown', verticalBarMouseDown.bind(this));
        this.scrollVerticalRail.removeEventListener('mousedown', verticalRailMouseDown.bind(this));
        this.scrollHorizontalBar.removeEventListener('mousedown', horizontalBarMouseDown.bind(this));
        this.scrollHorizontalRail.removeEventListener('mousedown', horizontalRailMouseDown.bind(this));
        this.scrollBody.removeEventListener('scroll', scrollBodyScroll.bind(this));
        this.scroll.removeEventListener('mousedown', scrollMouseDown.bind(this));
        this.scroll.removeEventListener('mouseleave', scrollMouseLeave.bind(this));
        //组件销毁
        this.$emit('ondestroy', this);
    },
    methods: {
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
                    this.scrollBody.scrollLeft = x;
                    this.elScrollLeft = this.scrollBody.scrollLeft;
                }
                if(y !== null) {
                    this.scrollBody.scrollTop = y;
                    this.elScrollTop = this.scrollBody.scrollTop;
                }
            } else {
                liike(scrollMove)(this.scrollBody, {
                    delay: delay,
                    duration: duration || this.wheeltime,
                    easing: easing || this.wheelseaing,
                    from: {
                        y: this.scrollBody.scrollTop,
                        x: this.scrollBody.scrollLeft,
                    },
                    to: {
                        y: y,
                        x: x
                    },
                    onend: () => {
                        if(x) this.elScrollLeft = this.scrollBody.scrollLeft;
                        if(y) this.elScrollTop = this.scrollBody.scrollTop;
                    }
                });
            }
        },
        /**
         * @method 刷新/重置滚动条基本属性
         */
        refresh(mutationList, observer) {
            if(this.vertical && this.barHeight < this.minBarHeight) {
                this.scrollVerticalBarRatio = (this.scrollBody.offsetHeight - this.minBarHeight + this.barHeight) / (this.scrollContent.offsetHeight + this.paddingHeight);
                this.barHeight = this.minBarHeight;
            }
            if(this.horizontal && this.barWidth < this.minBarWidth) {
                this.scrollHorizontalBarRatio = (this.scrollBody.offsetWidth - this.minBarWidth + this.barWidth) / (this.scrollContent.offsetWidth + this.paddingWidth);
                this.barWidth = this.minBarWidth;
            }
            if(mutationList) {
                this.scrollBody.scrollTop += 1;
            }
            this.$nextTick(() => {
                if(this.vertical) {
                    this.paddingHeight = this.scroll.offsetHeight - this.scrollBody.offsetHeight;
                    this.scrollVerticalBarRatio = this.scrollBody.offsetHeight / (this.scrollContent.offsetHeight);
                    this.barHeight = (this.scrollVerticalRail.offsetHeight) * this.scrollVerticalBarRatio;

                    this.showVertical = this.scrollBody.offsetHeight < this.scrollContent.offsetHeight;
                    this.scrollVerticalBar.style.height = this.barHeight + 'px';
                }

                if(this.horizontal) {
                    this.paddingWidth = this.scroll.offsetWidth - this.scrollBody.offsetWidth;
                    this.scrollHorizontalBarRatio = this.scrollBody.offsetWidth / (this.scrollContent.offsetWidth);
                    this.barWidth = this.scrollHorizontalRail.offsetWidth * this.scrollHorizontalBarRatio;

                    this.showHorizontal = this.scrollBody.offsetWidth < this.scrollContent.offsetWidth;
                    this.scrollHorizontalBar.style.width = this.barWidth + 'px';
                }
            });
        },
        /**
         * @method 获取距离视窗顶部的像素
         */
        getScrollTop() {
            let _el = this.scroll;
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
            let _el = this.scroll;
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
    created() {
        //查询IE浏览器版本，不是IE返回0
        ieVersion = navigator.appName == "Microsoft Internet Explorer" ? parseInt(navigator.appVersion.split(";")[1].replace(/[ ]/g, "").replace("MSIE","")) : 0;
        //兼容window.requestAnimationFrame函数
        (function() {
            var lastTime = 0;
            var vendors = ['webkit', 'moz'];
            for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
                window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||    // Webkit中此取消方法的名字变了
                                            window[vendors[x] + 'CancelRequestAnimationFrame'];
            }

            if (!window.requestAnimationFrame) {
                window.requestAnimationFrame = (callback, element) => {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
                    var id = window.setTimeout(() => {
                        callback(currTime + timeToCall);
                    }, timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };
            }
            if (!window.cancelAnimationFrame) {
                window.cancelAnimationFrame = function(id) {
                    clearTimeout(id);
                };
            }
        })();
    },
    mounted() {
        this.scroll = this.$el;
        this.scrollBody = this.$el.children[0];
        this.scrollContent = this.scrollBody.children[0];
        this.scrollVerticalBar = this.$el.children[1].children[0];
        this.scrollVerticalRail = this.$el.children[1].children[1];
        this.scrollHorizontalBar = this.$el.children[2].children[0];
        this.scrollHorizontalRail = this.$el.children[2].children[1];

        //根文档鼠标放开事件
        documentMouseUp = (e) => {
            this.isVerticalBarDrag = false;
            this.isHorizontalBarDrag = false;
            this.isContentDrag = false;
            this.scrollBody.className = this.scrollBody.className.replace(/ (active-vertical|active-horizontal)/g, '');
        }

        //拖拽滚动条事件
        mouseMoveFn = (e) => {
            this.scrollBodyTop = this.getScrollTop();

            let _scroll = this.scroll;
            let locy = e.pageY - this.scrollBodyTop;

            if(locy < 0) {
                this.scrollBody.scrollTop += locy / 3;
            } else if(locy > this.scroll.offsetHeight) {
                this.scrollBody.scrollTop += (locy - this.scrollBody.offsetHeight - this.paddingHeight) / 3;
            }
            setTimeout(() => {
                if(this.isContentDrag &&
                    this.scrollBody.scrollTop > 0 &&
                    this.scrollBody.scrollTop < this.scrollContent.offsetHeight - this.scrollBody.offsetHeight) {
                    mouseMoveFn(e);
                }
            }, 60);
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
                    this.elScrollTop = this.scrollBody.scrollTop + speedY;
                    this.scrollBody.scrollTop = this.elScrollTop;
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
                    this.elScrollLeft = this.scrollBody.scrollLeft + speedX;
                    this.scrollBody.scrollLeft = this.elScrollLeft;
                }
            }

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
                    if(speedY && this.scrollBody.scrollTop > 0 && this.scrollBody.scrollTop < this.scrollContent.offsetHeight - this.scrollBody.offsetHeight ||
                       speedX && this.scrollBody.scrollLeft > 0 && this.scrollBody.scrollLeft < this.scrollContent.offsetWidth - this.scrollBody.offsetWidth) {
                        dragCenterMouseMoveFn(e);
                    }
                }
            }, 20);
        }

        //根文档鼠标移动事件
        documentMouseMove = (e) => {
            //拖拽纵向滚动条
            if(this.isVerticalBarDrag) {
                this.scrollBody.scrollTop = (e.clientY - this.scroll.offsetTop - this.tempLocation.y) / this.scrollVerticalBarRatio;

                e.stopPropagation();
                e.preventDefault();
                e.cancelBubble = true;
            }
            //拖拽横向滚动条
            else if(this.isHorizontalBarDrag) {
                this.scrollBody.scrollLeft = (e.clientX - this.scroll.offsetLeft - this.tempLocation.x) / this.scrollHorizontalBarRatio;

                e.stopPropagation();
                e.preventDefault();
                e.cancelBubble = true;
            }
            //拖拽内容（跟着滚动滚动条）
            else if(this.isContentDrag) {
                mouseMoveFn(e);
            }
            //中键点击滚动
            else if(this.startDragOrigin) {
                _timer && window.clearTimeout(_timer);
                dragCenterMouseMoveFn(e);
                e.cancelBubble = true;
            }
        }

        //鼠标滚轮滚动事件
        //linear,quadIn,quadOut,quadInOut,cubicIn,cubicOut,cubicInOut,quartIn,quartOut,quartInOut,quintIn,quintOut,quintInOut,sineIn,sineOut,sineInOut,bounce
        scrollWheel = (e) => {
            if(this.anime && !ieVersion) {
                let _elScrollTop = this.elScrollTop;
                if(this.vertical) {
                    let deltaY = e.deltaY && (e.deltaY > 0 ? this.wheelstep : -this.wheelstep);
                    _elScrollTop = Math.min(Math.max(this.elScrollTop + deltaY, 0), this.scrollContent.offsetHeight - this.scrollBody.offsetHeight);

                    if(e.deltaY > 0) this.elScrollTop = Math.max(this.scrollBody.scrollTop, this.elScrollTop);
                    else if(e.deltaY < 0) this.elScrollTop = Math.min(this.scrollBody.scrollTop, this.elScrollTop);
                }

                let _elScrollLeft = this.elScrollLeft;
                if(this.horizontal) {
                    let deltaX = e.deltaX && (e.deltaX > 0 ? this.wheelstep : -this.wheelstep);
                    _elScrollLeft = Math.min(Math.max(this.elScrollLeft + deltaX, 0), this.scrollContent.offsetWidth - this.scrollBody.offsetWidth);

                    if(e.deltaX > 0) this.elScrollLeft = Math.max(this.scrollBody.scrollLeft, this.elScrollLeft);
                    else if(e.deltaX < 0) this.elScrollLeft = Math.min(this.scrollBody.scrollLeft, this.elScrollLeft);
                }

                liike(scrollMove)(this.scrollBody, {
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
                    (e.deltaX == 0 && (e.deltaY < 0 && this.elScrollTop <= 0 || e.deltaY > 0 && this.elScrollTop >= this.scrollContent.offsetHeight - this.scrollBody.offsetHeight)) ||
                    (e.deltaY == 0 && (e.deltaX < 0 && this.elScrollLeft <= 0 || e.deltaX > 0 && this.elScrollLeft >= this.scrollContent.offsetWidth - this.scrollBody.offsetWidth))
                )) {
                } else {
                    e.stopPropagation();
                    e.preventDefault();
                }
                this.elScrollTop = _elScrollTop;
                this.elScrollLeft = _elScrollLeft;
            } else {
                if(this.parentScroll && (
                    (e.deltaX == 0 && (e.deltaY < 0 && this.scrollBody.scrollTop <= 0 || e.deltaY > 0 && this.scrollBody.scrollTop >= this.scrollContent.offsetHeight - this.scrollBody.offsetHeight)) ||
                    (e.deltaY == 0 && (e.deltaX < 0 && this.scrollBody.scrollLeft <= 0 || e.deltaX > 0 && this.scrollBody.scrollLeft >= this.scrollContent.offsetWidth - this.scrollBody.offsetWidth))
                )) {
                } else {
                    e.stopPropagation();
                    e.preventDefault();
                }
                var deltaY = e.deltaY && (e.deltaY > 0 ? this.wheelstep : -this.wheelstep);
                var deltaX = e.deltaX && (e.deltaX > 0 ? this.wheelstep : -this.wheelstep);
                this.scrollBody.scrollTop += deltaY;
                this.scrollBody.scrollLeft += deltaX;
            }
        }

        //纵向滚动条块鼠标按下事件
        verticalBarMouseDown = (e) => {
            if(e.button == 0) {
                this.tempLocation.y = e.clientY - this.barTop - this.scroll.offsetTop;
                this.isVerticalBarDrag = true;
                this.scrollBody.className = this.scrollBody.className.split(' ').concat(['active-vertical']).join(' ');
                e.stopPropagation();
                e.preventDefault();
            }
        }

        //纵向滚动条底鼠标按下事件
        verticalRailMouseDown = (e) => {
            if(e.button == 0) {
                this.scrollBodyTop = this.getScrollTop();
                if(e.pageY < this.scrollBodyTop + this.barTop + this.barSpacing) {
                    this.scrollBody.scrollTop -= this.scrollBody.offsetHeight;
                } else if(e.pageY > this.barTop + this.barSpacing + this.barHeight + this.scrollBodyTop) {
                    this.scrollBody.scrollTop += this.scrollBody.offsetHeight;
                }
                e.stopPropagation();
                e.preventDefault();
            }
        }

        //横向滚动条块鼠标按下事件
        horizontalBarMouseDown = (e) => {
            if(e.button == 0) {
                this.tempLocation.x = e.clientX - this.barLeft - this.scroll.offsetLeft;
                this.isHorizontalBarDrag = true;
                this.scrollBody.className = this.scrollBody.className.split(' ').concat(['active-horizontal']).join(' ');
                e.stopPropagation();
                e.preventDefault();
            }
        }

        //横向滚动条底鼠标按下事件
        horizontalRailMouseDown = (e) => {
            if(e.button == 0) {
                if(e.pageX < this.scrollBodyLeft + this.barLeft + this.barSpacing) {
                    this.scrollBody.scrollLeft -= this.scrollBody.offsetWidth;
                } else if(e.pageX > this.barLeft + this.barSpacing + this.barWidth + this.scrollBodyLeft) {
                    this.scrollBody.scrollLeft += this.scrollBody.offsetWidth;
                }
                e.stopPropagation();
                e.preventDefault();
            }
        }

        //scrollBody滚动条滚动事件 scroll
        scrollBodyScroll = (e) => {
            if(this.vertical) {
                this.barTop = this.scrollBody.scrollTop / this.scrollContent.offsetHeight * this.scrollVerticalRail.offsetHeight;
                if(!ieVersion) {
                    this.scrollVerticalBar.style.transform = 'translateY(' + this.barTop + 'px)';
                } else if(ieVersion == 9 || ieVersion == 10) {
                    this.scrollVerticalBar.style.msTransform = 'translateY(' + this.barTop + 'px)';
                }
            }
            if(this.horizontal) {
                this.barLeft = this.scrollBody.scrollLeft / this.scrollContent.offsetWidth * this.scrollHorizontalRail.offsetWidth;
                if(!ieVersion) {
                    this.scrollHorizontalBar.style.transform = 'translateX(' + this.barLeft + 'px)';
                } else if(ieVersion == 9 || ieVersion == 10) {
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
            this.dragOrigin = '';
            _timer = null;
        }

        //纵向滚动条的比例
        this.scrollVerticalBarRatio = this.scroll.offsetHeight / this.scrollContent.offsetHeight;
        //横向滚动条的比例
        this.scrollHorizontalBarRatio = this.scroll.offsetWidth / this.scrollContent.offsetWidth;

        window.addEventListener('resize', () => {
            this.refresh();
        });

        //绑定事件
        document.addEventListener('mouseup', documentMouseUp.bind(this));
        document.addEventListener('mousemove', documentMouseMove.bind(this));
        this.scroll.addEventListener('wheel', scrollWheel.bind(this));
        this.scrollVerticalBar.addEventListener('mousedown', verticalBarMouseDown.bind(this));
        this.scrollVerticalRail.addEventListener('mousedown', verticalRailMouseDown.bind(this));
        this.scrollHorizontalBar.addEventListener('mousedown', horizontalBarMouseDown.bind(this));
        this.scrollHorizontalRail.addEventListener('mousedown', horizontalRailMouseDown.bind(this));
        this.scrollBody.addEventListener('scroll', scrollBodyScroll.bind(this));
        this.scroll.addEventListener('mousedown', scrollMouseDown.bind(this));
        this.scroll.addEventListener('mouseleave', scrollMouseLeave.bind(this));

        //初始化
        this.refresh();

        if(!ieVersion) {
            this.scrollObserver = new MutationObserver(this.refresh).observe(this.scroll, {
                attributeFilter: ['class', 'style'],
                childList: false,
                subtree: false
            });
            this.scrollContentObserver = new MutationObserver(this.refresh).observe(this.scrollContent, {
                attributeFilter: ['class', 'style'],
                //attributeOldValue: true,
                characterData: true,
                //characterDataOldValue: true,
                childList: true,
                subtree: this.watchSubTree
            });
        } else if(ieVersion == 9 || ieVersion == 10) {
            this.scrollContent.addEventListener('DOMNodeInserted', this.refresh, false);
            this.scrollContent.addEventListener('DOMNodeRemoved', this.refresh, false);
            this.scrollContent.addEventListener ('DOMAttrModified', this.refresh, false);
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

    .scroll {
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

        > .scroll-body {
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

            > .scroll-content {
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

            > .scroll-body {

                >.scroll-content {
                    box-shadow: 0px -48px 40px -40px inset rgba(0, 0, 0, 0.1),
                                0px 48px 40px -40px inset rgba(0, 0, 0, 0.1);
                }
            }
        }

        > .scroll-vertical {
            transition: $transition;

            > .scroll-vertical-bar {
                position: absolute;
                background: #333333;
                width: $scroll-width;
                top: 15px;
                opacity: 0.0;
                border-radius: $scroll-width;
                z-index: 2;
                right: $scroll-bar-right;
                transition: opacity $transition;
                outline: none !important;
                user-select: none;

                &:hover {
                    opacity: 0.6;
                }
            }

            > .scroll-vertical-rail {
                position: absolute;
                width: $scroll-width;
                height: calc(100% - 30px);
                opacity: 0.0;
                top: 15px;
                right: $scroll-bar-right;
                border-radius: $scroll-width;
                background: #333333;
                z-index: 1;
                transition: opacity $transition;
                user-select: none;

                &:hover {
                    opacity: 0.25;
                }
            }

            > .scroll-vertical-tool-up {
                cursor: pointer;
                position: absolute;
                font-size: 16px;
                top: 0px;
                right: $scroll-bar-right;
                color: #333333;
                transition: opacity $transition;
                opacity: 0.0;
                user-select: none;

                &:hover {
                    opacity: 0.6;
                }
            }

            > .scroll-vertical-tool-down {
                cursor: pointer;
                position: absolute;
                font-size: 16px;
                bottom: 0px;
                right: $scroll-bar-right;
                color: #333333;
                transition: opacity $transition;
                opacity: 0.0;
                user-select: none;

                &:hover {
                    opacity: 0.6;
                }
            }
        }


        > .scroll-horizontal {
            transition: $transition;

            > .scroll-horizontal-bar {
                position: absolute;
                background: #333333;
                height: $scroll-width;
                left: 15px;
                bottom: $scroll-bar-right;
                opacity: 0.0;
                border-radius: $scroll-width;
                z-index: 2;
                transition: opacity $transition;
                outline: none !important;
                user-select: none;

                &:hover {
                    opacity: 0.6;
                }
            }

            > .scroll-horizontal-rail {
                position: absolute;
                height: $scroll-width;
                width: calc(100% - 30px);
                opacity: 0.0;
                left: 15px;
                bottom: $scroll-bar-right;
                border-radius: $scroll-width;
                background: #333333;
                z-index: 1;
                transition: opacity $transition;
                user-select: none;

                &:hover {
                    opacity: 0.25;
                }
            }

            > .scroll-horizontal-tool-up {
                cursor: pointer;
                position: absolute;
                font-size: 16px;
                left: 0px;
                bottom: $scroll-bar-right;
                color: #333333;
                transition: opacity $transition;
                opacity: 0.0;
                user-select: none;

                &:hover {
                    opacity: 0.6;
                }
            }

            > .scroll-horizontal-tool-down {
                cursor: pointer;
                position: absolute;
                font-size: 16px;
                right: 0px;
                bottom: $scroll-bar-right;
                color: #333333;
                transition: opacity $transition;
                opacity: 0.0;
                user-select: none;

                &:hover {
                    opacity: 0.6;
                }
            }
        }

        > .scroll-hide {
            opacity: 0.0 !important;
            visibility: hidden !important;
            z-index: -10 !important;
        }
    }
</style>