// firebaseConfig.ts

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import urlHostToConfigsMap from './urlHostToConfigsMap';

type FirebaseConfig = {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
};

const currentDomain: string = window.location.hostname;

// Lấy cấu hình từ file đã tạo
const firebaseConfig: FirebaseConfig = urlHostToConfigsMap[currentDomain] || urlHostToConfigsMap['localhost']; // Mặc định cho localhost nếu không khớp

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Xuất app và config
export { app, db, firebaseConfig };
