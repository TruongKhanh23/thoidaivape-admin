import { db } from '@/firebaseConfig'; // Import auth và Firestore từ Firebase config
import store from '@/store';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export const handleAuthenticationSuccess = async (account, router) => {
    const currrentAccount = await createAccount(account);
    store.dispatch('setAccount', currrentAccount);
    store.dispatch('setIsLoggedIn', true);

    router.push('/').then(() => {
        window.scrollTo(0, 0);
    });
};

/**
 * Function để xử lý tạo hoặc đăng nhập account.
 * @param {Object} params - Các tham số.
 * @param {String} params.email - Email của người dùng.
 * @param {String} params.password - Mật khẩu (có thể null nếu sử dụng Google).
 * @param {Function} params.authMethod - Hàm đăng nhập (createAccountWithEmailAndPassword, signInWithEmailAndPassword, hoặc signInWithPopup).
 * @param {Object} [params.provider] - GoogleAuthProvider (nếu dùng Google).
 * @returns {Promise<Object>} - Thông tin người dùng.
 */
export async function createAccount(account) {
    try {
        // Kiểm tra nếu account đã tồn tại trong Firestore
        const accountDocRef = doc(db, 'accounts', account.uid);
        const accountDoc = await getDoc(accountDocRef);

        if (accountDoc.exists()) {
            return accountDoc.data();
        }

        // Nếu account chưa tồn tại, tạo mới
        const providerId = account.providerData[0]?.providerId.includes('google') ? 'Google' : 'Email';
        const accountData = {
            uid: account.uid,
            displayName: account.displayName || '', // Google sẽ có displayName
            email: account.email,
            createdDate: new Date(), // Dùng ngày hiện tại thay vì serverTimestamp()
            modifiedDate: new Date(), // Dùng ngày hiện tại thay vì serverTimestamp()
            provider: providerId,
            rights: []
        };

        // Lưu vào Firestore
        await setDoc(accountDocRef, accountData);

        return accountData;
    } catch (error) {
        console.error('Error creating account:', error.message);
        throw error;
    }
}

/**
 * Cập nhật thông tin người dùng
 * @param {Object} account - Dữ liệu người dùng cần cập nhật.
 */
export const updateAccount = async (account) => {
    try {
        console.log('account', account);

        if (!account.uid || typeof account.uid !== 'string') {
            throw new Error('Invalid account ID');
        }

        // Loại bỏ các field có giá trị undefined
        const sanitizedAccount = Object.fromEntries(Object.entries(account).filter(([_, value]) => value !== undefined));

        const accountDoc = doc(db, 'accounts', account.uid);
        await updateDoc(accountDoc, sanitizedAccount);

        // Lấy dữ liệu account hiện tại từ Vuex store
        const currentAccount = store.getters.getAccount || {};

        // Chỉ cập nhật các field đã thay đổi
        const updatedAccount = { ...currentAccount, ...sanitizedAccount };

        // Lưu lại dữ liệu đã cập nhật vào Vuex store
        store.dispatch('setAccount', updatedAccount);
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
};

/**
 * Lấy thông tin người dùng theo ID
 * @param {String} accountId - ID của người dùng cần lấy thông tin.
 * @returns {Promise<Object>} - Thông tin người dùng.
 */
export const getAccountById = async (accountId) => {
    try {
        const accountDocRef = doc(db, 'accounts', accountId);
        const accountDoc = await getDoc(accountDocRef);

        if (accountDoc.exists()) {
            store.dispatch('setAccount', accountDoc.data());

            return accountDoc.data();
        } else {
            throw new Error('Account not found');
        }
    } catch (error) {
        console.error('Error getting account:', error.message);
        throw error;
    }
};

// Hàm kiểm tra quyền
export const checkAccountRights = (requiredRights) => {
    // Lấy thông tin tài khoản hiện tại từ store
    const account = store.getters.getAccount;

    // Nếu không có tài khoản hoặc không có quyền, trả về false
    if (!account?.rights) return false;

    // Lấy danh sách quyền của tài khoản
    const accountRights = account.rights.map((item) => item.code);

    // Kiểm tra nếu quyền yêu cầu nằm trong danh sách quyền của tài khoản
    return accountRights.includes(requiredRights) || accountRights.includes('admin');
};
