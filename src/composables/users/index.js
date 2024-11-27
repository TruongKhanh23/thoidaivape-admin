import { collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore';
import { db } from './firebaseConfig'; // Đảm bảo import đúng

let searchCache = {};

// Cơ chế xóa cache cũ
const CACHE_EXPIRATION_MS = 60000; // 1 phút
setInterval(() => {
    const now = Date.now();
    for (const key in searchCache) {
        if (searchCache[key].lastAccess < now - CACHE_EXPIRATION_MS) {
            delete searchCache[key];
        }
    }
}, CACHE_EXPIRATION_MS);

export async function getPaginatedUsers(lastVisible = null, maxUsers = 50, searchQuery = '') {
    const usersRef = collection(db, 'users');
    let usersQuery = query(usersRef, orderBy('createdDate', 'desc'), limit(maxUsers));

    if (lastVisible) {
        usersQuery = query(usersRef, orderBy('createdDate', 'desc'), startAfter(lastVisible), limit(maxUsers));
    }

    if (searchQuery.trim()) {
        const cacheKey = searchQuery.trim() + (lastVisible ? lastVisible.id : '');
        if (searchCache[cacheKey]) {
            searchCache[cacheKey].lastAccess = Date.now();
            return searchCache[cacheKey];
        }
        usersQuery = query(usersQuery, where('fullName', '>=', searchQuery), where('fullName', '<=', searchQuery + '\uf8ff'));
    }

    const querySnapshot = await getDocs(usersQuery);
    const users = [];
    let lastDoc = null;

    querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
        lastDoc = doc;
    });

    const cacheKey = searchQuery + (lastVisible?.id || '');
    searchCache[cacheKey] = {
        users,
        lastVisible: lastDoc,
        totalRecords: querySnapshot.size,
        lastAccess: Date.now()
    };

    return {
        users,
        lastVisible: lastDoc,
        totalRecords: querySnapshot.size
    };
}
