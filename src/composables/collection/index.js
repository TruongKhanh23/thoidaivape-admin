import { collection, getDocs, query, updateDoc, addDoc, doc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { ref } from 'vue';
import store from '@/store';

export const getPaginatedCollections = async () => {
    const collections = ref([]);
    const q = query(collection(db, 'collections'));
    const querySnapshot = await getDocs(q);
    collections.value = querySnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
    });
    store.dispatch(
        'setCollections',
        collections.value.map((collection) => {
            return { id: collection.id, name: collection.name };
        })
    );
    return collections.value;
};

export const saveCollection = async (collectionData, description) => {
    const currentDate = new Date();
    const account = store.getters.getAccount;
    const data = ref({
        ...collectionData,
        description: description ?? '',
        updatedAt: currentDate,
        updatedBy: account.email
    });

    if (collectionData.id) {
        await updateDoc(doc(db, 'collections', collectionData.id), data.value);
    } else {
        await addDoc(collection(db, 'collections'), {
            ...data.value,
            createdAt: currentDate,
            createdBy: account.email
        });
    }
};
