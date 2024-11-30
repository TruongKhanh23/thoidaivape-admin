import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';

import { db } from '@/firebaseConfig';

export const getProductById = async (id) => {
    try {
        const productDetailsDocRef = doc(db, 'product-details', id);
        const productDetailsDoc = await getDoc(productDetailsDocRef);

        if (productDetailsDoc.exists()) {
            return {
                id,
                ...productDetailsDoc.data()
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

    const productsRef = collection(db, 'products');
    const q = query(productsRef);
    try {
        const querySnapshot = await getDocs(q, { source });
        querySnapshot.docs.map((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}
