// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // nếu cần auth
import { initializeFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import urlHostToConfigsMap from './urlHostToConfigsMap';

const currentDomain = window.location.hostname;

// Lấy cấu hình từ file đã tạo
const firebaseConfig = urlHostToConfigsMap[currentDomain] || urlHostToConfigsMap['localhost'];

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {});

const auth = getAuth(app); // nếu bạn sử dụng Firebase Auth

enableIndexedDbPersistence(db)
    .then(() => {
        console.log('Persistence enabled successfully');
    })
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            console.error('Multiple tabs open, persistence can only be enabled in one tab.');
        } else if (err.code === 'unimplemented') {
            console.error('The current browser does not support all features required for persistence.');
        }
    });

// Xuất app và config
export { app, auth, db, firebaseConfig };
