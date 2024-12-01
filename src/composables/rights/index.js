import store from '@/store';
import { computed } from 'vue';

const userRoles = ['read_user'];

const productRoles = ['create_product', 'read_product', 'update_product', 'delete_product'];

const orderRoles = ['read_order', 'update_order', 'delete_order'];

const discountCodeRoles = ['create_discountCode', 'read_discountCode', 'update_discountCode', 'delete_discountCode'];

const contactRoles = ['read_contact'];

const bannerRoles = ['create_banner', 'read_banner', 'update_banner', 'delete_banner'];

const newsRoles = ['create_news', 'read_news', 'update_news', 'delete_news'];

const collectionRoles = ['create_collection', 'read_collection', 'update_collection', 'delete_collection'];

const brandRoles = ['create_brand', 'read_brand', 'update_brand', 'delete_brand'];

export const allRoles = [...userRoles, ...productRoles, ...orderRoles, ...discountCodeRoles, ...contactRoles, ...bannerRoles, ...newsRoles, ...collectionRoles, ...brandRoles];

// Hàm kiểm tra quyền
export const checkAccountRights = (requiredRights) => {
    // Lấy thông tin tài khoản hiện tại từ store
    const account = computed(() => store.getters.getAccount);

    // Nếu không có tài khoản hoặc không có quyền, trả về false
    if (!account.value?.rights) return false;

    // Lấy danh sách quyền của tài khoản
    const accountRights = account.value.rights.map((item) => item.code);

    // Kiểm tra nếu quyền yêu cầu nằm trong danh sách quyền của tài khoản
    return accountRights.includes(requiredRights) || accountRights.includes('admin');
};
