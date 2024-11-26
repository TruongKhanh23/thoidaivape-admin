import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

export const getProductById = async (id) => {
    try {
        const accountDocRef = doc(db, 'products', id);
        const accountDoc = await getDoc(accountDocRef);

        if (accountDoc.exists()) {
            console.log('Product data:', accountDoc.data());
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
