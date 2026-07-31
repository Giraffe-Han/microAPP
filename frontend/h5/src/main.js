import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Vant组件库
import Vant from 'vant'
import 'vant/lib/index.css'

// 全局样式
import './styles/global.css'
import './utils/http'
import { recordEntryPosition } from './utils/miniprogram'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Vant)

// 记录进入 web-view 时的历史基准位置，用于智能返回判断入口页
router.isReady().then(() => {
  recordEntryPosition()
})

app.mount('#app')

