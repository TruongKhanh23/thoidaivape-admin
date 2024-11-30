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

document.documentElement.classList.toggle('app-dark');
</script>

<style scoped></style>
