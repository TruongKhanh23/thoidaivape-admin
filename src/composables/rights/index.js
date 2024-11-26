import store from "@/store"
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

// User
export function canReadUser() {
    return checkAccountRights('read_user');
}
// Product
export function canCreateProduct() {
    return checkAccountRights('create_product');
}

export function canReadProduct() {
    return checkAccountRights('read_product');
}

export function canUpdateProduct() {
    return checkAccountRights('update_product');
}

export function canDeleteProduct() {
    return checkAccountRights('delete_product');
}
