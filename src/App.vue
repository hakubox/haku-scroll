<template>
  <div id="app">
        <table class="center-table">
            <thead>
            </thead>
            <tbody>
                <tr>
                    <th>纵向</th>
                    <th>横向</th>
                    <th>长列表</th>
                </tr>
                <tr>
                    <td>
                        <haku-scroll ref="sc1"
                            :value.sync="value"
                            :max-value="360"
                            :size="100"
                            style="height:200px;width:20px;margin:auto;margin-bottom:10px;"></haku-scroll>
                        <strong>{{value.toFixed(1)}}</strong> / 360 <div class="color-block" :style="{background:`hsl(${value},50%,50%)`}"></div>
                    </td>
                    <td>
                        <label style="display:inline-block;margin-bottom: 5px;">
                            <input type="checkbox" v-model="sc2Disabled"> 禁用
                        </label>
                        <haku-scroll ref="sc2"
                            :disabled="sc2Disabled"
                            type="horizontal"
                            :value.sync="value"
                            :max-value="360"
                            :size="100"
                            style="width:200px;height:20px;margin:auto;"></haku-scroll>
                        <strong>{{value.toFixed(1)}}</strong> / 360
                    </td>
                    <td>
                        <haku-block
                            :scroll-auto-hide="false"
                            style="width: 200px;height: 200px;margin:auto;margin-bottom:10px;background-color:#F5F5F5;">
                            <ol>
                                <li v-for="item in 300">测试数据<i class="fal fa-user"></i></li>
                            </ol>
                        </haku-block>
                    </td>
                </tr>
                <tr>
                    <th>限定范围</th>
                    <th>步长</th>
                    <th>自动隐藏 & 滚动传递</th>
                </tr>
                <tr>
                    <td>
                        <haku-scroll ref="sc1"
                            type="horizontal"
                            :value.sync="value2"
                            :min="-20"
                            :max="60"
                            :max-value="100"
                            :min-value="-50"
                            :size="30"
                            style="height:20px;width:200px;margin:auto;"></haku-scroll>
                        -50 &lt; -20 &lt; <strong>{{value2.toFixed(1)}}</strong> &lt; 60 &lt; 100
                    </td>
                    <td>
                        <haku-scroll ref="sc1"
                            type="horizontal"
                            :step="20"
                            :value.sync="value3"
                            :max-value="100"
                            :size="30"
                            style="height:20px;width:200px;margin:auto;"></haku-scroll>
                        <strong>{{value3.toFixed(1)}}</strong> / 100
                    </td>
                    <td>
                        <haku-block
                            :parent-scroll="true"
                            content-style="white-space: nowrap;"
                            :horizontal="true"
                            style="width: 200px;height: 200px;margin:auto;margin-bottom:10px;background-color:#F5F5F5;">
                            <ol>
                                <li v-for="item in 30">测试数据测试数据测试数据测试数据测试数据测试数据<i class="fal fa-user"></i></li>
                            </ol>
                        </haku-block>
                    </td>
                </tr>
            </tbody>
        </table>
  </div>
</template>

<script>
import hakuScroll from "./plugin/scroll/scroll";
import hakuBlock from "./plugin/block/block"
export default {
    components: {
        hakuScroll,
        hakuBlock
    },
    name: 'app',
    data () {
        return {
            value: 0,
            value2: 0,
            value3: 0,
            sc2Disabled: false
        }
    },
    methods: {
    },
    mounted() {
    }
}
</script>

<style lang="scss">
@import './src/assets/scss/common.scss';

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 30px;
}

.color-block {
    display: inline-block;
    width: 1em;
    height: 1em;
    vertical-align: text-top;
    border-radius: 50%;
}

.center-table {
    width: 810px;
    margin: auto;
    border-spacing: 0px;
    table-layout: fixed;

    td {
        border-left: 1px solid #F5F5F5;
        border-bottom: 1px solid #F5F5F5;
        padding: 20px;
        text-align: center;
    }

    tr > td:last-child {
        border-right: 1px solid #F5F5F5;
    }

    th {
        color: white;
        background-color: #35495E;
        padding: 5px;
        text-align: center;
    }

    .haku-scroll-bar {
        background-color: #35495E !important;
    }

    .haku-scroll-rail {
        background-color: #41B883 !important;
    }
}
</style>
