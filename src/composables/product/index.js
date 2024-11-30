import { doc, getDoc } from 'firebase/firestore';
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
