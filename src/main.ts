import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@/assets/css/global.scss';
import SocketService from '@/utils/socket_service';
const ws = SocketService.Instance;
ws.connect();
const app = createApp(App);
app.config.globalProperties.$socket = ws;



app.use(router).mount('#app')
