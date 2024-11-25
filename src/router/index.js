import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import store from '@/store';
import { computed } from 'vue';

const routes = [
    {
        path: '/',
        component: AppLayout,
        meta: {
            requiresAuth: true
        },
        children: [
            {
                path: '/',
                name: 'home',
                component: () => import('@/views/admin/Home.vue')
            },
            {
                path: '/admin/users',
                name: 'users',
                meta: {
                    requiredRights: 'read_user'
                },
                component: () => import('@/views/admin/Users.vue')
            },
            {
                path: '/admin/accounts',
                name: 'accounts',
                meta: {
                    requiredRights: 'admin'
                },
                component: () => import('@/views/admin/Accounts.vue')
            },
            {
                path: '/admin/profile',
                name: 'profile',
                component: () => import('@/views/admin/Profile.vue')
            },
            {
                path: '/admin/products',
                name: 'products',
                component: () => import('@/views/admin/Products.vue')
            },
            {
                path: '/admin/sample-rich-text',
                name: 'sample-rich-text',
                component: () => import('@/views/admin/SampleRichText.vue')
            },
            {
                path: '/admin/sample-upload-file',
                name: 'sample-upload-file',
                component: () => import('@/views/sample/SampleUploadFile.vue')
            },
            {
                path: '/uikit/formlayout',
                name: 'formlayout',
                component: () => import('@/views/uikit/FormLayout.vue')
            },
            {
                path: '/uikit/input',
                name: 'input',
                component: () => import('@/views/uikit/InputDoc.vue')
            },
            {
                path: '/uikit/button',
                name: 'button',
                component: () => import('@/views/uikit/ButtonDoc.vue')
            },
            {
                path: '/uikit/table',
                name: 'table',
                component: () => import('@/views/uikit/TableDoc.vue')
            },
            {
                path: '/uikit/list',
                name: 'list',
                component: () => import('@/views/uikit/ListDoc.vue')
            },
            {
                path: '/uikit/tree',
                name: 'tree',
                component: () => import('@/views/uikit/TreeDoc.vue')
            },
            {
                path: '/uikit/panel',
                name: 'panel',
                component: () => import('@/views/uikit/PanelsDoc.vue')
            },

            {
                path: '/uikit/overlay',
                name: 'overlay',
                component: () => import('@/views/uikit/OverlayDoc.vue')
            },
            {
                path: '/uikit/media',
                name: 'media',
                component: () => import('@/views/uikit/MediaDoc.vue')
            },
            {
                path: '/uikit/message',
                name: 'message',
                component: () => import('@/views/uikit/MessagesDoc.vue')
            },
            {
                path: '/uikit/file',
                name: 'file',
                component: () => import('@/views/uikit/FileDoc.vue')
            },
            {
                path: '/uikit/menu',
                name: 'menu',
                component: () => import('@/views/uikit/MenuDoc.vue')
            },
            {
                path: '/uikit/charts',
                name: 'charts',
                component: () => import('@/views/uikit/ChartDoc.vue')
            },
            {
                path: '/uikit/misc',
                name: 'misc',
                component: () => import('@/views/uikit/MiscDoc.vue')
            },
            {
                path: '/uikit/timeline',
                name: 'timeline',
                component: () => import('@/views/uikit/TimelineDoc.vue')
            },
            {
                path: '/pages/empty',
                name: 'empty',
                component: () => import('@/views/pages/Empty.vue')
            },
            {
                path: '/pages/crud',
                name: 'crud',
                component: () => import('@/views/pages/Crud.vue')
            },
            {
                path: '/documentation',
                name: 'documentation',
                component: () => import('@/views/pages/Documentation.vue')
            }
        ]
    },
    {
        path: '/landing',
        name: 'landing',
        component: () => import('@/views/pages/Landing.vue')
    },
    {
        path: '/pages/notfound',
        name: 'notfound',
        component: () => import('@/views/pages/NotFound.vue')
    },
    {
        path: '/admin/login',
        name: 'login',
        component: () => import('@/views/admin/Login.vue')
    },
    {
        path: '/auth/access',
        name: 'accessDenied',
        component: () => import('@/views/pages/auth/Access.vue')
    },
    {
        path: '/auth/error',
        name: 'error',
        component: () => import('@/views/pages/auth/Error.vue')
    }
];
const router = createRouter({
    history: createWebHistory(),
    routes
});

const getCurrentAccount = () => {
    return new Promise((resolve, reject) => {
        const removeListener = onAuthStateChanged(
            getAuth(),
            (account) => {
                removeListener();
                resolve(account);
            },
            reject
        );
    });
};

const extractPaths = (routes) => {
    let paths = [];
    routes.forEach((route) => {
        if (route.path) {
            paths.push(route.path);
        }
        if (route.children) {
            paths = paths.concat(extractPaths(route.children));
        }
    });
    return paths;
};

const accountMoreInfo = computed(() => store.getters.getAccount);

router.beforeEach(async (to, from, next) => {
    let account = await getCurrentAccount();

    // Gán thêm quyền từ `store` nếu có
    if (account && accountMoreInfo.value) {
        account = {
            ...account,
            rights: accountMoreInfo.value?.rights ?? []
        };
    }

    // Kiểm tra nếu đường dẫn không nằm trong danh sách hợp lệ
    const validPaths = extractPaths(routes);
    if (!validPaths.includes(to.path) && to.path !== '/admin/login') {
        return next('/admin/login');
    }

    // Kiểm tra xác thực
    if (to.matched.some((record) => record.meta.requiresAuth)) {
        if (!account) {
            return next('/admin/login');
        }
    }

    // Kiểm tra quyền admin
    if (to.matched.some((record) => record.meta.requiredRights)) {
        const rights = !account?.rights?.map((item) => item.code) || [];
        if (rights?.includes(to.meta.requiredRights) || rights?.map((item) => item.code).includes('admin')) {
            // Nếu không đủ quyền, điều hướng tới trang từ chối truy cập
            next('/auth/access');
        }
    }

    // Ngăn người dùng đã đăng nhập vào lại trang login
    if (to.path === '/admin/login' && account) {
        return next('/');
    }

    next();
});

export default router;
