<template>
    <router-view />
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { getPaginatedBrands } from './composables/brand';
import { getPaginatedCollections } from './composables/collection';
import { useStore } from 'vuex';
import { getAccountById } from './composables/authentication';

const store = useStore();
const account = computed(() => store.getters.getAccount ?? {});

onMounted(async () => {
    await getAccountById(account.value.uid);
    await getPaginatedBrands();
    await getPaginatedCollections();
});
</script>

<style>
/* Mặc định (chế độ sáng) */
.p-overlay-mask {
    background-color: rgba(128, 128, 128, 0) !important;
}

/* Chế độ tối */
.app-dark .p-overlay-mask {
    background-color: rgba(0, 0, 0, 0) !important;
}
</style>
