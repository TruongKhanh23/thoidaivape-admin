import { db } from '@/firebaseConfig'; // Import auth và Firestore từ Firebase config
import store from '@/store';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export const handleAuthenticationSuccess = async (user, router) => {
    store.dispatch('setUser', user);
    store.dispatch('setIsLoggedIn', true);

    await createUser(user);

    router.push({ name: 'home' }).then(() => {
        window.scrollTo(0, 0);
    });
};

/**
 * Function để xử lý tạo hoặc đăng nhập user.
 * @param {Object} params - Các tham số.
 * @param {String} params.email - Email của người dùng.
 * @param {String} params.password - Mật khẩu (có thể null nếu sử dụng Google).
 * @param {Function} params.authMethod - Hàm đăng nhập (createUserWithEmailAndPassword, signInWithEmailAndPassword, hoặc signInWithPopup).
 * @param {Object} [params.provider] - GoogleAuthProvider (nếu dùng Google).
 * @returns {Promise<Object>} - Thông tin người dùng.
 */
export async function createUser(user) {
    console.log('user', user);

    try {
        // Kiểm tra nếu user đã tồn tại trong Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            console.log('User already exists:', user.uid);
            return userDoc.data();
        }

        // Nếu user chưa tồn tại, tạo mới
        const providerId = user.providerData[0]?.providerId.includes('google') ? 'Google' : 'Email';
        const userData = {
            userId: user.uid,
            displayName: user.displayName || '', // Google sẽ có displayName
            email: user.email,
            createdDate: new Date(), // Dùng ngày hiện tại thay vì serverTimestamp()
            modifiedDate: new Date(), // Dùng ngày hiện tại thay vì serverTimestamp()
            provider: providerId,
            rights: []
        };

        // Lưu vào Firestore
        await setDoc(userDocRef, userData);

        console.log('User created successfully:', userData);
        return userData;
    } catch (error) {
        console.error('Error creating user:', error.message);
        throw error;
    }
}

/**
 * Cập nhật thông tin người dùng
 * @param {Object} user - Dữ liệu người dùng cần cập nhật.
 */
export const updateUser = async (user) => {
    try {
        console.log('user', user);

        if (!user.id || typeof user.id !== 'string') {
            throw new Error('Invalid user ID');
        }

        // Loại bỏ các field có giá trị undefined
        const sanitizedUser = Object.fromEntries(Object.entries(user).filter(([_, value]) => value !== undefined));

        const userDoc = doc(db, 'users', user.id);
        await updateDoc(userDoc, sanitizedUser);

        // Lấy dữ liệu user hiện tại từ Vuex store
        const currentUser = store.getters.getUser || {};

        // Chỉ cập nhật các field đã thay đổi
        const updatedUser = { ...currentUser, ...sanitizedUser };

        // Lưu lại dữ liệu đã cập nhật vào Vuex store
        store.dispatch('setUser', updatedUser);

        console.log('User updated successfully!');
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
};

/**
 * Lấy thông tin người dùng theo ID
 * @param {String} userId - ID của người dùng cần lấy thông tin.
 * @returns {Promise<Object>} - Thông tin người dùng.
 */
export const getUserById = async (userId) => {
    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            console.log('User data:', userDoc.data());
            return userDoc.data();
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error getting user:', error.message);
        throw error;
    }
};  
