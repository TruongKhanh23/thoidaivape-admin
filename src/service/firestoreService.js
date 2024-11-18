import { collection, getDocs } from 'firebase/firestore';
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
