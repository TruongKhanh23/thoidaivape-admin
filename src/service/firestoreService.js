import { collection, getDocs, limit, orderBy, query, startAfter } from 'firebase/firestore';
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

export async function getPaginatedUsers(lastVisible, maxUsers = 50) {
    const usersRef = collection(db, 'users');
    let usersQuery = query(usersRef, orderBy('createdDate', 'desc'), limit(maxUsers));

    if (lastVisible) {
        usersQuery = query(usersRef, orderBy('createdDate', 'desc'), startAfter(lastVisible), limit(maxUsers));
    }

    const querySnapshot = await getDocs(usersQuery);
    const users = [];
    let lastDoc = null;

    querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
        lastDoc = doc; // Lưu tài liệu cuối cùng để phân trang
    });

    console.log('users', users);

    return { users, lastVisible: lastDoc };
}
