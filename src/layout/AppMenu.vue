<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in filteredModel" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<script setup>
import { ref, computed } from 'vue';

import AppMenuItem from './AppMenuItem.vue';
import store from '@/store';

const account = computed(() => store.getters.getAccount);
const rights = computed(() => account.value?.rights || []);

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

const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
    },
    {
        label: 'Manage',
        items: [{ label: 'Users', icon: 'pi pi-fw pi-user', to: '/admin/users', requiredRights: 'read_user' }]
    },
    {
        label: 'Admin',
        items: [{ label: 'Accounts', icon: 'pi pi-fw pi-briefcase', to: '/admin/accounts', requiredRights: 'admin' }]
    }
    //others.value,
    //uiComponents.value,
    //pages.value,
    //subMenu.value,
    //getStarted.value
]);

// Hàm lọc menu dựa trên quyền
const filterMenu = (items) => {
    return items
        .filter((item) => {
            // Nếu mục menu không yêu cầu quyền, luôn hiển thị
            if (!item.requiredRights) return true;
            // Nếu yêu cầu quyền, kiểm tra xem user có quyền hoặc là admin
            return rights.value.includes(item.requiredRights) || rights.value.includes('admin');
        })
        .map((item) => {
            // Lọc đệ quy nếu có các mục con
            if (item.items) {
                return { ...item, items: filterMenu(item.items) };
            }
            return item;
        });
};

// Model menu sau khi lọc
const filteredModel = computed(() => filterMenu(model.value));
</script>

<style lang="scss" scoped></style>
