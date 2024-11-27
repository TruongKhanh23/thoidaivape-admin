import { doc, getDoc, query, collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

export const getProductById = async (id) => {
    try {
        const accountDocRef = doc(db, 'products', id);
        const accountDoc = await getDoc(accountDocRef);

        if (accountDoc.exists()) {
            return {
                id,
                ...accountDoc.data()
            };
        } else {
            throw new Error('Product not found');
        }
    } catch (error) {
        console.error('Error getting product:', error.message);
        throw error;
    }
};

export async function getAllProducts(source = 'default') {
    const products = [];

    const q = query(collection(db, 'products'));
    const snapshot = await getDocs(q, { source });

    snapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
    });

    return products;
}
