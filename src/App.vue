<template>
    <router-view />
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { getPaginatedBrands } from './composables/brand';

const brands = ref([]);
onMounted(async () => {
    brands.value = await getPaginatedBrands();
});

document.documentElement.classList.toggle('app-dark');
</script>

<style scoped></style>
