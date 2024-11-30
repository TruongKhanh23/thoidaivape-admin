import { collection, updateDoc, addDoc, doc, query, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { ref } from 'vue';
import store from '@/store';

export const saveUser = async (userData) => {
    const currentDate = new Date();
    const account = store.getters.getAccount;
    const data = ref({
        ...userData,
        updatedAt: currentDate,
        updatedBy: account.email
    });

    if (userData.id) {
        await updateDoc(doc(db, 'users', userData.id), data.value);
    } else {
        await addDoc(collection(db, 'users'), {
            ...data.value,
            createdAt: currentDate,
            createdBy: account.email
        });
    }
};

export const getPaginatedUsers = async (source = 'default') => {
    const users = ref([]);
    const q = query(collection(db, 'users'));
    const querySnapshot = await getDocs(q, { source });
    users.value = querySnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
    });
    return users.value;
};
