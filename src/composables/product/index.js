import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

export const getProductById = async (id) => {
    try {
        const productDocRef = doc(db, 'products', id);
        const productDetailsDocRef = doc(db, 'product-details', id);
        const productDoc = await getDoc(productDocRef);
        const productDetailsDoc = await getDoc(productDetailsDocRef);

        if (productDoc.exists()) {
            return {
                id,
                ...productDoc.data(),
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
