<template>
    <router-view />
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { getPaginatedBrands } from './composables/brand';
import { getPaginatedCollections } from './composables/collection';

const brands = ref([]);
const collections = ref([]);
onMounted(async () => {
    brands.value = await getPaginatedBrands();
    collections.value = await getPaginatedCollections();
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
