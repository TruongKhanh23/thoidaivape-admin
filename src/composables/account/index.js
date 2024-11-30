import { ref } from 'vue';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, addDoc, startAfter, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebaseConfig'; // Đường dẫn tới file cấu hình firebase của bạn
import { allRoles } from '@/composables/rights';

const loading = ref(false);
const accounts = ref([]);
const lastVisible = ref(null);
const totalRecords = ref(0);
const filters = ref({ global: { value: '' } });
const selectedAccounts = ref([]);
const accountDialog = ref(false);
const deleteAccountDialog = ref(false);
const account = ref({});
const pageSize = ref(10);
const currentPage = ref(0);

// Hàm viết hoa chữ cái đầu mỗi từ
const capitalizeWords = (str) =>
    str
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

// Chuyển đổi roles thành cấu trúc { name, code }
const roles = allRoles.map((role) => ({
    name: capitalizeWords(role),
    code: role
}));

const getAllAccounts = async () => {
    try {
        await fetchAllAccounts('cache');
    } catch (error) {
        await fetchAllAccounts('server');
    }
};

const fetchAllAccounts = async (source = 'default') => {
    const q = query(collection(db, 'accounts'));
    try {
        const querySnapshot = await getDocs(q, { source });
        accounts.value = querySnapshot.docs.map((doc) => {
            return { id: doc.id, ...doc.data() };
        });
    } catch (error) {
        console.error('Error fetching accounts:', error);
        throw error;
    }
};

const searchCache = ref({}); // Khởi tạo cache tìm kiếm

const getPaginatedAccounts = async () => {
    const maxAccounts = 50; // Số lượng record tải mỗi lần
    const searchQuery = filters.value.global.value.trim();
    const accountsRef = collection(db, 'accounts');
    const cacheKey = searchQuery + (lastVisible.value ? lastVisible.value.id : '');
    const isSearching = searchQuery !== '';
    const isCached = searchCache.value[cacheKey]; // Chú ý cập nhật từ .value

    // Nếu đã có cache, sử dụng cache
    if (isCached) {
        updateStateFromCache(cacheKey);
        return;
    }

    let accountsQuery;

    // Trường hợp không có tìm kiếm, thực hiện phân trang thông thường
    if (!isSearching) {
        accountsQuery = query(accountsRef, orderBy('createdDate', 'desc'), limit(maxAccounts));
        if (lastVisible.value) {
            accountsQuery = query(accountsQuery, startAfter(lastVisible.value));
        }
    } else {
        // Trường hợp tìm kiếm
        accountsQuery = query(accountsRef, where('displayName', '>=', searchQuery), where('displayName', '<=', searchQuery + '\uf8ff'), orderBy('displayName', 'asc'), limit(maxAccounts));
    }

    // Thực hiện truy vấn
    const querySnapshot = await getDocs(accountsQuery);
    const results = querySnapshot.docs.map((doc) => ({ ...doc.data() }));

    // Lọc các tài khoản không có quyền 'admin'
    const filteredResults = results.filter((account) => !account.rights.some((right) => right.code === 'admin'));

    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    // Cập nhật cache và trạng thái
    updateCache(cacheKey, filteredResults, lastDoc, querySnapshot.size);
    updateState(filteredResults, lastDoc);
};

// Hàm cập nhật trạng thái từ cache
function updateStateFromCache(cacheKey) {
    const cachedData = searchCache.value[cacheKey]; // Chú ý cập nhật từ .value
    accounts.value = cachedData.accounts;
    lastVisible.value = cachedData.lastVisible;
    totalRecords.value = cachedData.totalRecords;
}

// Hàm cập nhật cache
function updateCache(key, accounts, lastDoc, totalRecords) {
    searchCache.value[key] = { accounts, lastVisible: lastDoc, totalRecords }; // Chú ý cập nhật từ .value
}

// Hàm cập nhật trạng thái
function updateState(accountsData, lastDoc) {
    accounts.value = accountsData;
    lastVisible.value = lastDoc;
    totalRecords.value = accountsData.length; // hoặc tổng số record thực tế từ Firebase
}

const saveAccount = async () => {
    loading.value = true;
    if (account.value.uid) {
        await updateDoc(doc(db, 'accounts', account.value.uid), account.value);
    } else {
        await addDoc(collection(db, 'accounts'), account.value);
    }
    accountDialog.value = false;

    // Reset pagination và fetch lại danh sách
    lastVisible.value = null;
    currentPage.value = 0;
    await getAllAccounts();
    loading.value = false;
};

const deleteAccount = async (id) => {
    try {
        loading.value = true;
        await deleteDoc(doc(db, 'accounts', id));
    } catch (error) {
        console.error('Error deleting account:', error);
    } finally {
        let index = accounts.value.findIndex((item) => item.uid === id);
        if (index !== -1) {
            accounts.value.splice(index, 1);
        }
        deleteAccountDialog.value = false;
        loading.value = false;
    }
};

const searchAccounts = (query) => {
    filters.value.global.value = query;
};

function onPageChange(event) {
    currentPage.value = event.page;
    pageSize.value = event.rows;
    // Đảm bảo lastVisible được reset khi thay đổi trang
    lastVisible.value = null;
    getAllAccounts(); // Gọi lại fetchUsers khi thay đổi trang
}

const onSearch = () => {
    lastVisible.value = null; // Reset phân trang
    currentPage.value = 0; // Reset trang hiện tại
    getAllAccounts(); // Gọi lại tìm kiếm
};

export {
    searchCache,
    onSearch,
    onPageChange,
    currentPage,
    pageSize,
    totalRecords,
    lastVisible,
    loading,
    accounts,
    filters,
    selectedAccounts,
    accountDialog,
    deleteAccountDialog,
    account,
    roles,
    getAllAccounts,
    getPaginatedAccounts,
    saveAccount,
    deleteAccount,
    searchAccounts
};
