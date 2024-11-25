<template>
    <div className="card">
        <div class="font-semibold text-xl mb-4">Thêm mới sản phẩm</div>
        <div>
            <div class="mb-4">
                <label class="block font-semibold">Tên sản phẩm</label>
                <InputText v-model="product.name" placeholder="Nhập tên sản phẩm" class="w-full" />
            </div>
            <div class="mb-4">
                <label class="block font-semibold">Mô tả ngắn</label>
                <Textarea v-model="product.shortDescription" placeholder="Nhập mô tả ngắn" class="w-full" rows="3" />
            </div>

            <div class="mb-4">
                <label class="block font-semibold">Ảnh đại diện</label>
                <Toast />
                <ImageUpload idPrefix="thumbnail" :multiple="false" @binary-selected="handleUploadThumbnail" />
            </div>
            <div class="mb-4">
                <label class="block font-semibold">Giá</label>
                <InputNumber v-model="product.price" :min="0" class="w-full" mode="decimal" showButtons />
            </div>
            <div class="mb-4">
                <label class="block font-semibold">Giá khuyến mãi</label>
                <InputNumber v-model="product.salePrice" :min="0" class="w-full" mode="decimal" showButtons />
            </div>
            <div class="mb-4">
                <label class="block font-semibold">Ảnh sản phẩm</label>
                <ImageUpload idPrefix="product-images" :multiple="true" @binary-selected="handleUploadProductImages" />
            </div>
            <div class="mb-4">
                <label class="block font-semibold">Bộ sưu tập</label>
                <Dropdown v-model="product.collectionId" :options="collections" optionLabel="name" class="w-full" />
            </div>
            <div class="mb-4">
                <label class="block font-semibold">Trạng thái</label>
                <Dropdown v-model="product.status" :options="statusOptions" optionLabel="name" class="w-full" />
            </div>
            <div class="mb-4">
                <label class="block font-semibold">Thẻ (Tags)</label>
                <MultiSelect v-model="product.tags" :options="tags" optionLabel="name" placeholder="Thêm tags" :filter="true" class="w-full max-w-full">
                    <template #value="slotProps">
                        <div class="inline-flex items-center py-1 px-2 bg-primary text-primary-contrast rounded-border mr-2" v-for="option of slotProps.value" :key="option.id">
                            <div>#{{ option.name }}</div>
                        </div>
                        <template v-if="!slotProps.value || slotProps.value.length === 0">
                            <div class="p-1">Thêm tags</div>
                        </template>
                    </template>
                    <template #option="slotProps">
                        <div class="flex items-center">
                            <div>#{{ slotProps.option.name }}</div>
                        </div>
                    </template>
                </MultiSelect>
            </div>
            <div class="mb-4">
                <label class="block font-semibold">Số lượng đã bán</label>
                <InputNumber v-model="product.soldAmount" :min="0" class="w-full" />
            </div>
            <div class="mb-4">
                <label class="block font-semibold">Số hơi</label>
                <InputNumber v-model="product.hits" :min="0" class="w-full" />
            </div>
            <div class="mb-4">
                <label class="block font-semibold">Công suất</label>
                <InputNumber v-model="product.power" :min="0" class="w-full" />
            </div>
            <div class="mb-4">
                <label class="block font-semibold">Thương hiệu</label>
                <Dropdown v-model="product.brand" :options="brands" optionLabel="name" class="w-full" />
            </div>

            <div class="mb-4">
                <label class="block font-semibold">Mô tả chi tiết</label>
                <RichTextEditor idPrefix="product-description" @richTextUpdated="handleUpdateRichText" v-model="product.description" />
            </div>

            <div class="flex justify-end gap-2">
                <Button label="Hủy" icon="pi pi-times" class="p-button-text" @click="productDialog = false" />
                <Button label="Lưu" icon="pi pi-check" class="p-button-primary" @click="saveProduct" />
            </div>
        </div>
    </div>
</template>

<script setup>
import ImageUpload from '@/components/Input/ImageUpload.vue';
import RichTextEditor from '@/components/Input/RichTextEditor.vue';
import { ref } from 'vue';
//import { collection, updateDoc, addDoc, doc } from 'firebase/firestore';
//import { db } from '@/firebaseConfig'; // Đường dẫn tới file cấu hình firebase của bạn
import { useRouter } from 'vue-router';

const router = useRouter();
const product = ref({});
const thumbnail = ref();
const images = ref([]);
const description = ref();

const collections = [{ id: 'freebase', name: 'Freebase' }];
const statusOptions = [
    { id: 'in_stock', name: 'Còn hàng' },
    { id: 'out_of_stock', name: 'Hết hàng' }
];
const brands = [{ id: 'dotmod', name: 'dotmod' }];
const tags = [
    { id: 'vape', name: 'Vape' },
    { id: 'cks', name: 'CKS' }
];

function handleUploadThumbnail(binary) {
    thumbnail.value = binary;
    console.log('Thumbnail Data:', thumbnail.value);
}

function handleUploadProductImages(data) {
    images.value = Array.isArray(data) ? data : [data];
    console.log('images Data:', images.value);
}

function handleUpdateRichText(content) {
    description.value = content;
    console.log('Description Data:', description.value);
}

const saveProduct = async () => {
    const data = { ...product.value, thumbnail: thumbnail.value, images: images.value, description: description.value };

    if (product.value.id) {
        // Cập nhật sản phẩm
        console.log('data', data);
        //await updateDoc(doc(db, 'products', product.value.id), data);
    } else {
        // Tạo sản phẩm mới
        console.log('data', data);
        //await addDoc(collection(db, 'products'), data);
    }
    router.push('/admin/products');
};
</script>
