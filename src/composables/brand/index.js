import { collection, updateDoc, addDoc, doc, query, getDocs } from 'firebase/firestore';
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

export const getPaginatedBrands = async () => {
    const brands = ref([]);
    const q = query(collection(db, 'brands'));
    const querySnapshot = await getDocs(q);
    brands.value = querySnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
    });
    store.dispatch(
        'setBrands',
        brands.value.map((brand) => {
            return { id: brand.id, name: brand.name };
        })
    );
    return brands.value;
};
