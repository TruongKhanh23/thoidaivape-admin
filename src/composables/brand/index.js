import { collection, updateDoc, addDoc, doc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { ref } from 'vue';
import store from '@/store';

export const saveBrand = async (brandData) => {
    const currentDate = new Date();
    const account = store.getters.getAccount;
    const data = ref({
        ...brandData,
        updatedAt: currentDate,
        updatedBy: account.email
    });

    if (brandData.id) {
        await updateDoc(doc(db, 'brands', brandData.id), data.value);
    } else {
        await addDoc(collection(db, 'brands'), {
            ...data.value,
            createdAt: currentDate,
            createdBy: account.email
        });
    }
};
