// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // nếu cần auth
import { getFirestore } from 'firebase/firestore';
import urlHostToConfigsMap from './urlHostToConfigsMap';

const currentDomain = window.location.hostname;

// Lấy cấu hình từ file đã tạo
const firebaseConfig = urlHostToConfigsMap[currentDomain] || urlHostToConfigsMap['localhost'];

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // nếu bạn sử dụng Firebase Auth

// Xuất app và config
export { app, auth, db, firebaseConfig };
