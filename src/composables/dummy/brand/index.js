import { db } from '@/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

// Các giá trị cố định
const brands = [
    { id: 'oxva', name: 'Oxva' },
    { id: 'aspire', name: 'Aspire' },
    { id: 'fitpod', name: 'Fitpod' },
    { id: 'lost-vape', name: 'Lost Vape' },
    { id: 'voopoo', name: 'Voopoo' },
    { id: 'geek-vape', name: 'Geek Vape' },
    { id: 'dovpo', name: 'Dovpo' },
    { id: 'sp2s', name: 'SP2S' },
    { id: 'romio-astro', name: 'Romio Astro' },
    { id: 'dotmod', name: 'dotMod' }
];

// Tạo sản phẩm mới
export const createDummyBrands = async () => {
    const now = new Date();
    try {
        for (let i = 0; i < 30; i++) {
            const brand = {
                createdBy: 'thoidaivape.cafe@gmail.com',
                updatedBy: 'thoidaivape.cafe@gmail.com',
                createdAt: now,
                updatedAt: now,
                name: brands[i].name
            };
            await addDoc(collection(db, 'brands'), brand);
            console.log(`Added brand: Brand ${i + 1}`);
        }
    } catch (error) {
        console.log(console.error);
    }
    console.log('All brands have been added.');
};
