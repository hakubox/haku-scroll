<template>
  <div id="app">
      <haku-scroll ref="sc1" class="haku-scroll">
          <p>-</p><p>-</p>
          <p>-</p><p>-</p>
          <p>-</p><p>-</p>
          <p>-</p><p>-</p>
          <p>-</p><p>-</p>
          <p>-</p><p>-</p>
          <p>-</p><p>-</p>
          <p>-</p><p>-</p>
      </haku-scroll>
  </div>
</template>

<script>
import hakuScroll from "./plugin/haku-scroll/haku-scroll";
export default {
    components: {
        hakuScroll,
    },
    name: 'app',
    data () {
        return {
            msg: 'Welcome to Your Vue.js App'
        }
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

.haku-scroll {
    background-color: #EEE;
    width: 200px;
    height: 200px;
    margin: auto;
}
</style>
