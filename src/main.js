import { createApp } from 'vue'
import App from './App.vue'

import { createI18n } from "vue-i18n";
import messages from './languages/i18n.js'

const i18n = createI18n({
  legacy: false,
  locale: navigator.languages && navigator.languages[0] ? navigator.languages[0].split('-')[0].toLowerCase() : 'en',
  fallbackLocale: 'en',
  globalInjection: true,
  messages
});

const app = createApp(App)

app.use(i18n)

app.mount('#app')
