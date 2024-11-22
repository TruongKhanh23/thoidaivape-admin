import { ref } from 'vue';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, addDoc, startAfter, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebaseConfig'; // Đường dẫn tới file cấu hình firebase của bạn

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
const userRoles = ['read_user'];

const productRoles = ['create_product', 'read_product', 'update_product', 'delete_product'];

const orderRoles = ['read_order', 'update_order', 'delete_order'];

const discountCodeRoles = ['create_discountCode', 'read_discountCode', 'update_discountCode', 'delete_discountCode'];

const contactRoles = ['read_contact'];

const bannerRoles = ['create_banner', 'read_banner', 'update_banner', 'delete_banner'];

const newsRoles = ['create_news', 'read_news', 'update_news', 'delete_news'];

// Gom tất cả roles lại
const allRoles = [...userRoles, ...productRoles, ...orderRoles, ...discountCodeRoles, ...contactRoles, ...bannerRoles, ...newsRoles];

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
    loading.value = true;

    // Truy vấn để lấy tất cả các tài khoản (Firestore không hỗ trợ lọc trực tiếp trong trường hợp này).
    const q = query(collection(db, 'accounts'));
    const querySnapshot = await getDocs(q);

    // Lọc các tài khoản không có quyền 'admin' dựa trên trường code trong rights.
    accounts.value = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })).filter((account) => !account.rights.some((right) => right.code === 'admin'));

    loading.value = false;
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
    const results = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

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
    if (account.value.id) {
        await updateDoc(doc(db, 'accounts', account.value.id), account.value);
    } else {
        await addDoc(collection(db, 'accounts'), account.value);
    }
    accountDialog.value = false;

    // Reset pagination và fetch lại danh sách
    lastVisible.value = null;
    currentPage.value = 0;
    await getPaginatedAccounts();
    loading.value = false;
};

const deleteAccount = async (id) => {
    try {
        loading.value = true;
        await deleteDoc(doc(db, 'accounts', id)); // Xóa tài khoản trên Firestore
    } catch (error) {
        console.error('Error deleting account:', error);
    } finally {
        let index = accounts.value.findIndex((item) => item.id === id);
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
    getPaginatedAccounts(); // Gọi lại fetchUsers khi thay đổi trang
}

const onSearch = () => {
    lastVisible.value = null; // Reset phân trang
    currentPage.value = 0; // Reset trang hiện tại
    getPaginatedAccounts(); // Gọi lại tìm kiếm
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
