<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<script setup>
import { ref, computed } from 'vue';

import AppMenuItem from './AppMenuItem.vue';
import store from '@/store';
import { RIGHTS } from '@/config/rightsConfig';

const menuMapping = {
    [RIGHTS.ADMIN]: [{ label: 'Accounts', icon: 'pi pi-fw pi-home', to: '/admin/accounts' }],
    [RIGHTS.READ_USER]: [{ label: 'Users', icon: 'pi pi-fw pi-home', to: '/admin/users' }]
};

function getMenuItemsByRights(userRights) {
    const menuItems = [];
    userRights.forEach((right) => {
        if (menuMapping[right]) {
            menuItems.push(...menuMapping[right]);
        }
    });
    console.log("menuItems", menuItems);

    return menuItems;
}

const account = computed(() => store.getters.getAccount);
const rights = computed(() => account.value.rights);

const others = ref({
    label: 'Sample',
    items: [{ label: 'Firebase', icon: 'pi pi-fw pi-home', to: '/admin/firebase' }]
});
const uiComponents = ref({
    label: 'UI Components',
    items: [
        { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', to: '/uikit/formlayout' },
        { label: 'Input', icon: 'pi pi-fw pi-check-square', to: '/uikit/input' },
        { label: 'Button', icon: 'pi pi-fw pi-mobile', to: '/uikit/button', class: 'rotated-icon' },
        { label: 'Table', icon: 'pi pi-fw pi-table', to: '/uikit/table' },
        { label: 'List', icon: 'pi pi-fw pi-list', to: '/uikit/list' },
        { label: 'Tree', icon: 'pi pi-fw pi-share-alt', to: '/uikit/tree' },
        { label: 'Panel', icon: 'pi pi-fw pi-tablet', to: '/uikit/panel' },
        { label: 'Overlay', icon: 'pi pi-fw pi-clone', to: '/uikit/overlay' },
        { label: 'Media', icon: 'pi pi-fw pi-image', to: '/uikit/media' },
        { label: 'Menu', icon: 'pi pi-fw pi-bars', to: '/uikit/menu' },
        { label: 'Message', icon: 'pi pi-fw pi-comment', to: '/uikit/message' },
        { label: 'File', icon: 'pi pi-fw pi-file', to: '/uikit/file' },
        { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', to: '/uikit/charts' },
        { label: 'Timeline', icon: 'pi pi-fw pi-calendar', to: '/uikit/timeline' },
        { label: 'Misc', icon: 'pi pi-fw pi-circle', to: '/uikit/misc' }
    ]
});

const pages = ref({
    label: 'Pages',
    icon: 'pi pi-fw pi-briefcase',
    to: '/pages',
    items: [
        {
            label: 'Landing',
            icon: 'pi pi-fw pi-globe',
            to: '/landing'
        },
        {
            label: 'Auth',
            icon: 'pi pi-fw pi-user',
            items: [
                {
                    label: 'Login',
                    icon: 'pi pi-fw pi-sign-in',
                    to: '/auth/login'
                },
                {
                    label: 'Error',
                    icon: 'pi pi-fw pi-times-circle',
                    to: '/auth/error'
                },
                {
                    label: 'Access Denied',
                    icon: 'pi pi-fw pi-lock',
                    to: '/auth/access'
                }
            ]
        },
        {
            label: 'Crud',
            icon: 'pi pi-fw pi-pencil',
            to: '/pages/crud'
        },
        {
            label: 'Not Found',
            icon: 'pi pi-fw pi-exclamation-circle',
            to: '/pages/notfound'
        },
        {
            label: 'Empty',
            icon: 'pi pi-fw pi-circle-off',
            to: '/pages/empty'
        }
    ]
});

const subMenu = ref({
    label: 'Hierarchy',
    items: [
        {
            label: 'Submenu 1',
            icon: 'pi pi-fw pi-bookmark',
            items: [
                {
                    label: 'Submenu 1.1',
                    icon: 'pi pi-fw pi-bookmark',
                    items: [
                        { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
                        { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
                        { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' }
                    ]
                },
                {
                    label: 'Submenu 1.2',
                    icon: 'pi pi-fw pi-bookmark',
                    items: [{ label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }]
                }
            ]
        },
        {
            label: 'Submenu 2',
            icon: 'pi pi-fw pi-bookmark',
            items: [
                {
                    label: 'Submenu 2.1',
                    icon: 'pi pi-fw pi-bookmark',
                    items: [
                        { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark' },
                        { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark' }
                    ]
                },
                {
                    label: 'Submenu 2.2',
                    icon: 'pi pi-fw pi-bookmark',
                    items: [{ label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark' }]
                }
            ]
        }
    ]
});

const getStarted = ref({
    label: 'Get Started',
    items: [
        {
            label: 'Documentation',
            icon: 'pi pi-fw pi-book',
            to: '/documentation'
        },
        {
            label: 'View Source',
            icon: 'pi pi-fw pi-github',
            url: 'https://github.com/primefaces/sakai-vue',
            target: '_blank'
        }
    ]
});

const dashboard = ref({
    label: 'Trang chủ',
    items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
});

const dynamicMenuItems = computed(() => getMenuItemsByRights(rights.value));

const admin = ref({
    label: 'Admin',
    items: []
});

const manage = ref({
    label: 'Manage',
    items: []
});

dynamicMenuItems.value.forEach((menuItem) => {
    if (menuItem.to.includes('/admin')) {
        admin.value.items.push(menuItem);
    } else {
        manage.value.items.push(menuItem);
    }
});

if (rights.value.includes('admin')) {
    admin.value.items.push(accountPage);
    manage.value.items.push(usersPage);
}

if (rights.value.includes('read_user')) {
    manage.value.items.push(usersPage);
}

const model = ref([
    dashboard.value,
    manage.value,
    admin.value,
    //others.value,
    //uiComponents.value,
    //pages.value,
    //subMenu.value,
    //getStarted.value
]);
</script>

<style lang="scss" scoped></style>
