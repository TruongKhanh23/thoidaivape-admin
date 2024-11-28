import { collection, getDocs, limit, orderBy, query, startAfter, where, updateDoc, addDoc, doc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { ref } from 'vue';
import store from '@/store';

let searchCache = {}; // Khởi tạo cache tìm kiếm

export async function getPaginatedCollections(lastVisible = null, maxCollections = 50, searchQuery = '') {
    const collectionsRef = collection(db, 'collections');
    let collectionsQuery = query(collectionsRef, orderBy('createdAt', 'desc'), limit(maxCollections));

    // Nếu có lastVisible, sử dụng startAfter để lấy trang tiếp theo
    if (lastVisible) {
        collectionsQuery = query(collectionsRef, orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(maxCollections));
    }

    // Kiểm tra xem có từ khóa tìm kiếm hay không
    if (searchQuery && searchQuery.trim() !== '') {
        // Kiểm tra xem kết quả đã được cache chưa
        const cacheKey = searchQuery.trim() + (lastVisible ? lastVisible.id : '');
        if (searchCache[cacheKey]) {
            // Nếu có, lấy dữ liệu từ cache
            return {
                collections: searchCache[cacheKey].collections,
                lastVisible: searchCache[cacheKey].lastVisible,
                totalRecords: searchCache[cacheKey].totalRecords
            };
        }

        // Nếu chưa cache, thực hiện truy vấn
        collectionsQuery = query(collectionsQuery, where('name', '>=', searchQuery), where('name', '<=', searchQuery + '\uf8ff'));
    } else {
        // Nếu không có từ khóa tìm kiếm, trả về tất cả người dùng
        if (searchCache[''] && searchCache[''].collections.length > 0) {
            return {
                collections: searchCache[''].collections,
                lastVisible: searchCache[''].lastVisible,
                totalRecords: searchCache[''].totalRecords
            };
        }
    }

    // Thực hiện truy vấn và lấy dữ liệu
    const querySnapshot = await getDocs(collectionsQuery);
    const collections = [];
    let lastDoc = null;

    // Lặp qua các tài liệu và lấy dữ liệu
    querySnapshot.forEach((doc) => {
        collections.push({ id: doc.id, ...doc.data() });
        lastDoc = doc;
    });

    // Cập nhật cache với kết quả tìm kiếm
    const cacheKey = searchQuery + lastVisible?.id;
    if (searchQuery && searchQuery.trim() !== '' && !searchCache[cacheKey]) {
        // Kiểm tra cache theo searchQuery kết hợp với lastVisible
        searchCache[cacheKey] = {
            collections,
            lastVisible: lastDoc,
            totalRecords: querySnapshot.size
        };
    } else {
        // Cập nhật cache cho kết quả không có tìm kiếm (tất cả người dùng)
        searchCache[''] = {
            collections,
            lastVisible: lastDoc,
            totalRecords: querySnapshot.size
        };
    }

    return {
        collections,
        lastVisible: lastDoc,
        totalRecords: querySnapshot.size
    };
}

export const saveCollection = async (collectionData, description) => {
    const currentDate = new Date();
    const account = store.getters.getAccount;
    console.log('collectionData', collectionData);
    console.log('description', description);
    const data = ref({
        ...collectionData,
        description: description ?? '',
        updatedAt: currentDate,
        updatedBy: account.email
    });

    if (collectionData.id) {
        await updateDoc(doc(db, 'collections', collectionData.id), data.value);
    } else {
        await addDoc(collection(db, 'collections'), {
            ...data.value,
            createdAt: currentDate,
            createdBy: account.email
        });
    }
};
