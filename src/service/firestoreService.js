import { collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Hàm lấy danh sách sản phẩm từ Firestore
export const getProducts = async () => {
    const products = [];

    // Sử dụng collection để lấy tham chiếu đến bộ sưu tập 'products'
    const productsCollection = collection(db, 'products');

    // Lấy danh sách tài liệu từ bộ sưu tập
    const snapshot = await getDocs(productsCollection);

    snapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
    });

    return products;
};

let searchCache = {}; // Khởi tạo cache tìm kiếm

export async function getPaginatedUsers(lastVisible = null, maxUsers = 50, searchQuery = '') {
    const usersRef = collection(db, 'users');
    let usersQuery = query(usersRef, orderBy('createdDate', 'desc'), limit(maxUsers));

    // Nếu có lastVisible, sử dụng startAfter để lấy trang tiếp theo
    if (lastVisible) {
        usersQuery = query(usersRef, orderBy('createdDate', 'desc'), startAfter(lastVisible), limit(maxUsers));
    }

    // Kiểm tra xem có từ khóa tìm kiếm hay không
    if (searchQuery && searchQuery.trim() !== '') {
        // Kiểm tra xem kết quả đã được cache chưa
        const cacheKey = searchQuery.trim() + (lastVisible ? lastVisible.id : '');
        if (searchCache[cacheKey]) {
            // Nếu có, lấy dữ liệu từ cache
            return {
                users: searchCache[cacheKey].users,
                lastVisible: searchCache[cacheKey].lastVisible,
                totalRecords: searchCache[cacheKey].totalRecords
            };
        }

        // Nếu chưa cache, thực hiện truy vấn
        usersQuery = query(usersQuery, where('fullName', '>=', searchQuery), where('fullName', '<=', searchQuery + '\uf8ff'));
    } else {
        // Nếu không có từ khóa tìm kiếm, trả về tất cả người dùng
        if (searchCache[''] && searchCache[''].users.length > 0) {
            return {
                users: searchCache[''].users,
                lastVisible: searchCache[''].lastVisible,
                totalRecords: searchCache[''].totalRecords
            };
        }
    }

    // Thực hiện truy vấn và lấy dữ liệu
    const querySnapshot = await getDocs(usersQuery);
    const users = [];
    let lastDoc = null;

    // Lặp qua các tài liệu và lấy dữ liệu
    querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
        lastDoc = doc;
    });

    // Cập nhật cache với kết quả tìm kiếm
    const cacheKey = searchQuery + lastVisible?.id;
    if (searchQuery && searchQuery.trim() !== '' && !searchCache[cacheKey]) {
        // Kiểm tra cache theo searchQuery kết hợp với lastVisible
        searchCache[cacheKey] = {
            users,
            lastVisible: lastDoc,
            totalRecords: querySnapshot.size
        };
    } else {
        // Cập nhật cache cho kết quả không có tìm kiếm (tất cả người dùng)
        searchCache[''] = {
            users,
            lastVisible: lastDoc,
            totalRecords: querySnapshot.size
        };
    }

    return {
        users,
        lastVisible: lastDoc,
        totalRecords: querySnapshot.size
    };
}

export async function getPaginatedCollection(collectionName, lastVisible = null, maxItems = 50, searchQuery = '', searchField = 'fullName') {
    const collectionRef = collection(db, collectionName);
    let queryRef = query(collectionRef, orderBy('createdDate', 'desc'), limit(maxItems));

    // Nếu có lastVisible, sử dụng startAfter để lấy trang tiếp theo
    if (lastVisible) {
        queryRef = query(collectionRef, orderBy('createdDate', 'desc'), startAfter(lastVisible), limit(maxItems));
    }

    // Kiểm tra xem có từ khóa tìm kiếm hay không
    if (searchQuery && searchQuery.trim() !== '') {
        const cacheKey = `${collectionName}_${searchQuery.trim()}_${lastVisible ? lastVisible.id : ''}`;
        if (searchCache[cacheKey]) {
            return searchCache[cacheKey];
        }
        queryRef = query(queryRef, where(searchField, '>=', searchQuery), where(searchField, '<=', searchQuery + '\uf8ff'));
    } else {
        const cacheKey = `${collectionName}_all`;
        if (searchCache[cacheKey]) {
            return searchCache[cacheKey];
        }
    }

    // Thực hiện truy vấn và lấy dữ liệu
    const querySnapshot = await getDocs(queryRef);
    const items = [];
    let lastDoc = null;

    querySnapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
        lastDoc = doc;
    });

    const result = { items, lastVisible: lastDoc, totalRecords: querySnapshot.size };

    // Cập nhật cache
    const cacheKey = searchQuery ? `${collectionName}_${searchQuery.trim()}_${lastVisible?.id}` : `${collectionName}_all`;
    searchCache[cacheKey] = result;

    return result;
}
