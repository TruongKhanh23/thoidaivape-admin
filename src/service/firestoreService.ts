import { collection, getDocs } from 'firebase/firestore'; // Import các hàm cần thiết
import { db } from '../firebaseConfig';

// Định nghĩa kiểu dữ liệu của sản phẩm (product)
interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    stock: number;
}

// Hàm lấy danh sách sản phẩm từ Firestore
export const getProducts = async (): Promise<Product[]> => {
    const products: Product[] = [];

    // Sử dụng collection để lấy tham chiếu đến bộ sưu tập 'products'
    const productsCollection = collection(db, 'products');

    // Lấy danh sách tài liệu từ bộ sưu tập
    const snapshot = await getDocs(productsCollection);

    snapshot.forEach((doc) => {
        // Chỉ định kiểu cho doc
        products.push({ id: doc.id, ...doc.data() } as Product);
    });

    return products;
};
