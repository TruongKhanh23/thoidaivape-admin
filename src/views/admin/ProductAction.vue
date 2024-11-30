<template>
    <div className="card">
        <div class="font-semibold text-xl mb-4">{{ tittle }} sản phẩm</div>
        <div>
            <div class="mb-4">
                <label for=".name" class="block font-semibold">Tên sản phẩm</label>
                <InputText v-model="product.name" placeholder="Nhập tên sản phẩm" class="w-full" />
            </div>
            <div class="mb-4">
                <label for="shortDescription" class="block font-semibold">Mô tả ngắn</label>
                <Textarea v-model="product.shortDescription" placeholder="Nhập mô tả ngắn" class="w-full" rows="3" />
            </div>

            <div class="mb-4">
                <label for="thumbnail" class="block font-semibold">Ảnh đại diện</label>
                <Toast />
                <ImageUpload idPrefix="thumbnail" :multiple="false" @binary-selected="handleUploadThumbnail" :initialBinaries="[product.thumbnail]" />
            </div>
            <div class="mb-4">
                <label for="price" class="block font-semibold">Giá</label>
                <InputNumber v-model="product.price" :min="0" class="w-full" mode="decimal" showButtons placeholder="Ví dụ: 100.000" />
            </div>
            <div class="mb-4">
                <label for="salePrice" class="block font-semibold">Giá khuyến mãi</label>
                <InputNumber v-model="product.salePrice" :min="0" class="w-full" mode="decimal" showButtons placeholder="Ví dụ: 100.000" />
            </div>
            <div class="mb-4">
                <label for="product-images" class="block font-semibold">Ảnh sản phẩm</label>
                <ImageUpload idPrefix="product-images" :multiple="true" @binary-selected="handleUploadProductImages" :initialBinaries="product.images" />
            </div>
            <div class="mb-4">
                <label for="collectionId" class="block font-semibold">Bộ sưu tập</label>
                <Dropdown v-model="product.collection" :options="collections" optionLabel="name" placeholder="Chọn bộ sưu tập" class="w-full" />
            </div>
            <div class="mb-4">
                <label for="status" class="block font-semibold">Trạng thái</label>
                <Dropdown v-model="product.status" :options="statusOptions" optionLabel="name" placeholder="Chọn trạng thái sản phẩm" class="w-full" />
            </div>
            <div class="mb-4">
                <label for="tags" class="block font-semibold">Thẻ (Tags)</label>
                <InputTag v-model="product.tags" :initialContent="product.tags" @action:tagsUpdated="handleUpdateTags" />
            </div>
            <div class="mb-4">
                <label for="soldAmount" class="block font-semibold">Số lượng đã bán</label>
                <InputNumber v-model="product.soldAmount" :min="0" class="w-full" placeholder="Ví dụ: 100" />
            </div>
            <div class="mb-4">
                <label for="hits" class="block font-semibold">Số hơi</label>
                <InputNumber v-model="product.hits" :min="0" class="w-full" placeholder="Ví dụ: 100" />
            </div>
            <div class="mb-4">
                <label for="power" class="block font-semibold">Công suất</label>
                <InputNumber v-model="product.power" :min="0" class="w-full" placeholder="Ví dụ: 100" />
            </div>
            <div class="mb-4">
                <label for="brand" class="block font-semibold">Thương hiệu</label>
                <Dropdown v-model="product.brand" :options="brands" optionLabel="name" class="w-full" placeholder="Chọn thương hiệu của sản phẩm" />
            </div>

            <div class="mb-4">
                <label for="product-description" class="block font-semibold">Mô tả chi tiết</label>
                <RichTextEditor idPrefix="product-description" @richTextUpdated="handleUpdateRichText" v-model="product.description" :initialContent="product.description" />
            </div>

            <div class="flex justify-end gap-2">
                <Button label="Hủy" icon="pi pi-times" class="p-button-text" @click="handleOnCancle" />
                <Button label="Lưu" icon="pi pi-check" class="p-button-primary" @click="saveProduct" />
            </div>
        </div>
    </div>
</template>

<script setup>
import ImageUpload from '@/components/Input/ImageUpload.vue';
import RichTextEditor from '@/components/Input/RichTextEditor.vue';
import { computed, onMounted, ref } from 'vue';
import { collection, updateDoc, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { getProductById } from '@/composables/product';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import InputTag from '@/components/Input/InputTag.vue';

const store = useStore();
const route = useRoute();
const router = useRouter();

const action = computed(() => route.params.action);
const productId = computed(() => route.params.id);
const tittle = computed(() => (action.value == 'update' ? 'Chỉnh sửa' : 'Thêm mới'));

const product = ref({});

onMounted(async () => {
    try {
        if (action.value == 'update') {
            const data = await getProductById(productId.value);
            product.value = data;
        }
    } catch (error) {
        console.error('Error loading account data:', error.message);
    }
});

const account = computed(() => store.getters.getAccount);

const collections = [
    { id: 'podsystem', name: 'Podsystem' },
    { id: 'vape-box', name: 'Vape Box' },
    { id: 'freebase', name: 'Freebase' },
    { id: 'occ-coil', name: 'Occ Coil' },
    { id: 'pod-head', name: 'Pod Head' },
    { id: 'saltnic', name: 'Saltnic' }
]; // Thêm bộ sưu tập thực tế của bạn ở đây
const statusOptions = [
    { id: 'in_stock', name: 'Còn hàng' },
    { id: 'out_of_stock', name: 'Hết hàng' }
];
const brands = [
    { id: 'oxva', name: 'Oxva' },
    { id: 'aspire', name: 'Aspire' },
    { id: 'fitpod', name: 'Fitpod' },
    { id: 'lost-vape', name: 'Lost Vape' },
    { id: 'voopoo', name: 'Voopoo' },
    { id: 'geek-vape', name: 'Geek Vape' },
    { id: 'dovpo', name: 'Dovpo' },
    { id: 'sp2s', name: 'SP2S' },
    { id: 'romio-astro', name: 'Romio Astro' },
    { id: 'dotmod', name: 'dotMod' }
];

function handleUploadThumbnail(binary) {
    product.value.thumbnail = binary;
}

function handleUploadProductImages(data) {
    product.value.images = Array.isArray(data) ? data : [data];
}

function handleUpdateRichText(content) {
    product.value.description = content;
}

function handleUpdateTags(content) {
    product.value.tags = content;
}

const saveProduct = async () => {
    const currentDate = new Date();
    const { id, description, images, thumbnail, ...rest } = product.value; // Tách các trường riêng biệt

    const commonData = {
        ...rest,
        updatedAt: currentDate,
        updatedBy: account.value.email
    };

    const collectionId = commonData.collection.id;

    const productDetails = { description, images, collectionId };
    const productThumbnail = { thumbnail, collectionId };

    if (id) {
        // Cập nhật sản phẩm đã tồn tại song song
        const updateProductThumbnail = updateDoc(doc(db, 'product-thumbnail', id), thumbnail);
        const updateProductDetails = updateDoc(doc(db, 'product-details', id), productDetails);
        const updateProduct = updateDoc(doc(db, 'products', id), commonData);

        await Promise.all([updateProductThumbnail, updateProductDetails, updateProduct]); // Chạy song song
    } else {
        const productRef = await addDoc(collection(db, 'products'), {
            ...commonData,
            createdAt: currentDate,
            createdBy: account.value.email
        });

        await Promise.all([setDoc(doc(db, 'product-thumbnail', productRef.id), productThumbnail), setDoc(doc(db, 'product-details', productRef.id), productDetails)]);
    }

    router.push('/admin/products');
};

function handleOnCancle() {
    router.push('/admin/products');
}
</script>
