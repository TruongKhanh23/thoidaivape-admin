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
const pageSize = ref(1);
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

console.log(roles);

const getAllAccounts = async () => {
    loading.value = true;
    const q = query(collection(db, 'accounts'), where('rights', '!=', ['admin']));
    const querySnapshot = await getDocs(q);
    accounts.value = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    loading.value = false;
};

let searchCache = {}; // Khởi tạo cache tìm kiếm

const getPaginatedAccounts = async () => {
    const maxAccounts = 50;
    const searchQuery = filters.value.global.value;
    const accountsRef = collection(db, 'accounts');
    const cacheKey = searchQuery.trim() + (lastVisible.value ? lastVisible.value.id : '');
    const isSearching = searchQuery.trim() !== '';
    const isCached = searchCache[cacheKey];

    // Kiểm tra cache trước
    if (isCached) {
        updateStateFromCache(cacheKey);
        return;
    }

    // Tạo query cơ bản
    let accountsQuery = query(accountsRef, where('rights', '!=', ['admin']), orderBy('createdDate', 'desc'), limit(maxAccounts));

    // Thêm phân trang nếu có lastVisible
    if (lastVisible.value) {
        accountsQuery = query(accountsQuery, startAfter(lastVisible.value));
    }

    // Thêm điều kiện tìm kiếm nếu có từ khóa
    if (isSearching) {
        accountsQuery = query(accountsQuery, where('displayName', '>=', searchQuery), where('displayName', '<=', searchQuery + '\uf8ff'));
    }

    // Thực hiện truy vấn
    const querySnapshot = await getDocs(accountsQuery);
    const accounts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    // Cập nhật cache
    updateCache(cacheKey, accounts, lastDoc, querySnapshot.size);

    // Cập nhật trạng thái
    updateState(accounts, lastDoc);
    return true;
};

// Hàm cập nhật trạng thái từ cache
function updateStateFromCache(cacheKey) {
    const cachedData = searchCache[cacheKey];
    accounts.value = cachedData.accounts;
    lastVisible.value = cachedData.lastVisible;
    totalRecords.value = cachedData.totalRecords;
}

// Hàm cập nhật cache
function updateCache(key, accounts, lastDoc, totalRecords) {
    searchCache[key] = { accounts, lastVisible: lastDoc, totalRecords };
}

// Hàm cập nhật trạng thái
function updateState(accountsData, lastDoc) {
    accounts.value = accountsData;
    lastVisible.value = lastDoc;
    totalRecords.value = totalRecords;
}

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

function onPageChange(event) {
    currentPage.value = event.page;
    pageSize.value = event.rows;
    // Đảm bảo lastVisible được reset khi thay đổi trang
    lastVisible.value = null;
    getPaginatedAccounts(); // Gọi lại fetchUsers khi thay đổi trang
}

export {
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
