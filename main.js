import Vue from 'vue'
import App from './App'
import Bmob from "hydrogen-js-sdk"

Bmob.initialize("065590be294853c1", "752752","d1b2bbf90fdd31300d53eda95e19106d");
Vue.prototype.Bmob = Bmob
Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
