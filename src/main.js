import { createApp } from 'vue'
import './style.css'
import App from './App.vue'


// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
})

//Router
import router from './router'


createApp(App).use(vuetify).use(router).mount('#app')
