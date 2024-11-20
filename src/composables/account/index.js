import { db } from '@/firebaseConfig'; // Update with your Firebase config file path
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { computed, ref } from 'vue';

const accounts = ref([]);
const searchTerm = ref('');
const currentAccount = ref({
    name: '',
    email: '',
    permissions: [],
    role: 'admin'
});
const showAccountDialog = ref(false);
const isEditMode = ref(false);

const permissions = [
    'create_user',
    'read_user',
    'update_user',
    'delete_user',
    'create_product',
    'read_product',
    'update_product',
    'delete_product',
    'create_order',
    'read_order',
    'update_order',
    'delete_order',
    'create_discountCode',
    'read_discountCode',
    'update_discountCode',
    'delete_discountCode',
    'create_contact',
    'read_contact',
    'update_contact',
    'delete_contact',
    'create_banner',
    'read_banner',
    'update_banner',
    'delete_banner',
    'create_news',
    'read_news',
    'update_news',
    'delete_news'
];

async function fetchAccounts() {
    const querySnapshot = await getDocs(collection(db, 'accounts'));
    accounts.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

function openNewAccountDialog() {
    currentAccount.value = {
        name: '',
        email: '',
        permissions: [],
        role: 'admin'
    };
    isEditMode.value = false;
    showAccountDialog.value = true;
}

function closeAccountDialog() {
    showAccountDialog.value = false;
}

async function saveAccount() {
    if (isEditMode.value) {
        const accountRef = doc(db, 'accounts', currentAccount.value.id);
        await updateDoc(accountRef, currentAccount.value);
    } else {
        await addDoc(collection(db, 'accounts'), currentAccount.value);
    }
    await fetchAccounts();
    closeAccountDialog();
}

function editAccount(account) {
    currentAccount.value = { ...account };
    isEditMode.value = true;
    showAccountDialog.value = true;
}

async function deleteAccount(accountId) {
    const accountRef = doc(db, 'accounts', accountId);
    await deleteDoc(accountRef);
    await fetchAccounts();
}

function searchAccounts() {
    return accounts.value.filter((account) => account.name.toLowerCase().includes(searchTerm.value.toLowerCase()));
}

const filteredAccounts = computed(() => {
    if (searchTerm.value.trim()) {
        return searchAccounts();
    }
    return accounts.value;
});

fetchAccounts();

export function useAccount() {
    return {
        accounts,
        searchTerm,
        filteredAccounts,
        currentAccount,
        showAccountDialog,
        isEditMode,
        permissions,
        openNewAccountDialog,
        closeAccountDialog,
        saveAccount,
        editAccount,
        deleteAccount,
        searchAccounts
    };
}
