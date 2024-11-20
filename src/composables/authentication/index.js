import { db } from '@/firebaseConfig'; // Import auth và Firestore từ Firebase config
import store from '@/store';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export const handleAuthenticationSuccess = async (account, router) => {
    store.dispatch('setAccount', account);
    store.dispatch('setIsLoggedIn', true);

    await createAccount(account);

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
    console.log('account', account);

    try {
        // Kiểm tra nếu account đã tồn tại trong Firestore
        const accountDocRef = doc(db, 'accounts', account.uid);
        const accountDoc = await getDoc(accountDocRef);

        if (accountDoc.exists()) {
            console.log('Account already exists:', account.uid);
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

        console.log('Account created successfully:', accountData);
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

        console.log('Account updated successfully!');
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
            console.log('Account data:', accountDoc.data());
            return accountDoc.data();
        } else {
            throw new Error('Account not found');
        }
    } catch (error) {
        console.error('Error getting account:', error.message);
        throw error;
    }
};
