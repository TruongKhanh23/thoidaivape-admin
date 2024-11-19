<template>
    <div className="card">
        <div class="font-semibold text-xl mb-4">Sample Firebase</div>
        <h1>Product List</h1>
        <ul>
            <li v-for="product in products" :key="product.id">
                <h3>{{ product.name }}</h3>
                <p>{{ product.description }}</p>
                <p>Price: ${{ product.price }}</p>
                <p>Stock: {{ product.stock }}</p>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { getProducts } from '@/service/firestoreService';
import { defineComponent, onMounted, ref } from 'vue';

// Định nghĩa kiểu dữ liệu cho sản phẩm
interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    stock: number;
}

export default defineComponent({
    name: 'ProductList',
    setup() {
        const products = ref<Product[]>([]); // Chỉ định kiểu cho products

        const fetchProducts = async () => {
            products.value = await getProducts();
        };

        onMounted(() => {
            fetchProducts();
        });

        return {
            products
        };
    }
});
</script>

<style scoped>
/* CSS styles cho component */
</style>
