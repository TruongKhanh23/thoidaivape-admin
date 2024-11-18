// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import urlHostToConfigsMap from './urlHostToConfigsMap';

const currentDomain = window.location.hostname;

// Lấy cấu hình từ file đã tạo
const firebaseConfig = urlHostToConfigsMap[currentDomain] || urlHostToConfigsMap['localhost'];

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Xuất app và config
export { app, db, firebaseConfig };
