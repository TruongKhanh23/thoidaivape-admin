// urlHostToConfigsMap.ts

export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
}

const urlHostToConfigsMap: Record<string, FirebaseConfig> = {
    'sale-online-dev.vercel.app': {
        apiKey: 'AIzaSyBwNaoEsfW7PFPNySTtPE7dS8lgr5TdsBA',
        authDomain: 'sale-online-dev.firebaseapp.com',
        projectId: 'sale-online-dev',
        storageBucket: 'sale-online-dev.appspot.com',
        messagingSenderId: '692087438243',
        appId: '1:692087438243:web:38616c6e17dd554384f816',
        measurementId: 'G-HT9R87F5QR'
    },
    'sale-online-uat.vercel.app': {
        apiKey: 'AIzaSyAb5Ud9SO_YhoNTMO1uHEmTxuXn-uLckBg',
        authDomain: 'sale-online-uat.firebaseapp.com',
        projectId: 'sale-online-uat',
        storageBucket: 'sale-online-uat.appspot.com',
        messagingSenderId: '1003785668280',
        appId: '1:1003785668280:web:70490a3f03b34f102d564d',
        measurementId: 'G-JYSVZ53YHT'
    },
    'sale-online-production.vercel.app': {
        apiKey: 'AIzaSyB9A6rFmgs_A59RwHeEraNJrHQr42-L15g',
        authDomain: 'sale-online-production.firebaseapp.com',
        projectId: 'sale-online-production',
        storageBucket: 'sale-online-production.appspot.com',
        messagingSenderId: '300900337276',
        appId: '1:300900337276:web:cdc7a62899aadd803d2bf9',
        measurementId: 'G-C8K2939SL1'
    },
    localhost: {
        apiKey: 'AIzaSyBwNaoEsfW7PFPNySTtPE7dS8lgr5TdsBA', // Mặc định cho localhost
        authDomain: 'sale-online-dev.firebaseapp.com',
        projectId: 'sale-online-dev',
        storageBucket: 'sale-online-dev.appspot.com',
        messagingSenderId: '692087438243',
        appId: '1:692087438243:web:38616c6e17dd554384f816',
        measurementId: 'G-HT9R87F5QR'
    }
};

export default urlHostToConfigsMap;
