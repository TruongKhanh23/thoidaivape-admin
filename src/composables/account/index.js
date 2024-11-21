import { ref } from 'vue';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig'; // Đường dẫn tới file cấu hình firebase của bạn

const loading = ref(false);
const accounts = ref([]);
const filters = ref({ global: { value: '' } });
const selectedAccounts = ref([]);
const accountDialog = ref(false);
const deleteAccountDialog = ref(false);
const account = ref({});
const userRoles = [
    'read_user',
];

const productRoles = [
    'create_product',
    'read_product',
    'update_product',
    'delete_product'
];

const orderRoles = [
    'read_order',
    'update_order',
    'delete_order'
];

const discountCodeRoles = [
    'create_discountCode',
    'read_discountCode',
    'update_discountCode',
    'delete_discountCode'
];

const contactRoles = [
    'read_contact',
];

const bannerRoles = [
    'create_banner',
    'read_banner',
    'update_banner',
    'delete_banner'
];

const newsRoles = [
    'create_news',
    'read_news',
    'update_news',
    'delete_news'
];

// Gom tất cả vào một mảng lớn
const roles = [
    ...userRoles,
    ...productRoles,
    ...orderRoles,
    ...discountCodeRoles,
    ...contactRoles,
    ...bannerRoles,
    ...newsRoles
];


const getPaginatedAccounts = async () => {
    loading.value = true;
    const q = query(collection(db, 'accounts'), where('rights', '!=', ['admin']));
    const querySnapshot = await getDocs(q);
    accounts.value = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    loading.value = false;
};

const saveAccount = async () => {
    if (account.value.id) {
        await updateDoc(doc(db, 'accounts', account.value.id), account.value);
    } else {
        await addDoc(collection(db, 'accounts'), account.value);
    }
    accountDialog.value = false;
    await getPaginatedAccounts();
};

const deleteAccount = async (id) => {
    await deleteDoc(doc(db, 'accounts', id));
    deleteAccountDialog.value = false;
    await getPaginatedAccounts();
};

const searchAccounts = (query) => {
    filters.value.global.value = query;
};

export { loading, accounts, filters, selectedAccounts, accountDialog, deleteAccountDialog, account, roles, getPaginatedAccounts, saveAccount, deleteAccount, searchAccounts };
