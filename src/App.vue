<template>
  <div id="app">
        <table class="center-table">
            <thead>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <haku-scroll ref="sc1"
                            :value.sync="value"
                            :max-value="maxValue"
                            :size="scrollSize"
                            style="height:200px;width:20px;margin:auto;margin-bottom:10px;"></haku-scroll>
                        {{value.toFixed(1)}} / {{maxValue}}
                    </td>
                    <td>
                        <haku-scroll ref="sc2"
                            type="horizontal"
                            :value.sync="value"
                            :max-value="maxValue"
                            :size="scrollSize"
                            style="width:200px;height:20px;margin:auto;margin-bottom:10px;"></haku-scroll>
                        {{value.toFixed(1)}} / {{maxValue}}
                    </td>
                    <td>
                        <haku-block ref="box3" @scroll="refresh" @oninit="refresh"
                            style="width: 200px;height: 200px;margin:auto;margin-bottom:10px;background-color:#F5F5F5;">
                            <ol>
                                <li v-for="item in 30">测试数据<i class="fal fa-user"></i></li>
                            </ol>
                        </haku-block>
                        {{box3ScrollY}} / {{box3ScrollMaxY}}
                    </td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td>
                    </td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
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
            scrollSize: 30,
            maxValue: 100,
            box3ScrollY: 0,
            box3ScrollMaxY: 0
        }
    },
    methods: {
        refresh({ x = null, y = null }) {
            this.box3ScrollY = this.$refs.box3.scrollY.toFixed(0);
            this.box3ScrollMaxY = this.$refs.box3.scrollMaxY;
        }
    },
    mounted() {
        console.log(this.$refs.box3.scrollMaxY)
    }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.center-table {
    width: 810px;
    margin: auto;
    border-spacing: 0px;
    table-layout: fixed;

    td {
        border: 1px solid #F5F5F5;
        padding: 20px;
        text-align: center;
    }
}
</style>
