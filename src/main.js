import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import Aura from '@primevue/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '@/assets/styles.scss';
import '@/assets/tailwind.css';

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import store from './store/index';

let isInitialized = false;

onAuthStateChanged(auth, (user) => {
    checkInternetConnection();

    if (!isInitialized) {
        if (user) {
            router.push('/');
        }
        const app = createApp(App);
        app.use(router);
        app.use(store);
        app.use(PrimeVue, {
            theme: {
                preset: Aura,
                options: {
                    darkModeSelector: '.app-dark'
                }
            }
        });
        app.use(ToastService);
        app.use(ConfirmationService);
        app.mount('#app');
        isInitialized = true;
    }
});

// Detect offline/online status and notify the user
const handleOffline = () => {
    console.log('Bạn đã mất kết nối internet. Vui lòng kiểm tra kết nối của bạn.');
};

const handleOnline = () => {
    console.log('Kết nối internet đã được khôi phục. Hãy nhấn F5 để thử lại.');
};

const checkInternetConnection = () => {
    if (!navigator.onLine) {
        console.log('Bạn đã mất kết nối internet. Vui lòng kiểm tra kết nối của bạn.');
    }
};

window.addEventListener('offline', handleOffline);
window.addEventListener('online', handleOnline);
