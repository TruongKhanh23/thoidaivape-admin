<template>
    <div>
        <div class="card">
            <div class="font-semibold text-xl">Danh sách sản phẩm</div>
            <DataTable
                ref="dtProducts"
                v-model:selection="selectedProducts"
                :value="products"
                :paginator="true"
                :loading="loading"
                :rows="pageSize"
                dataKey="id"
                :filters="filters"
                :first="currentPage * pageSize"
                :totalRecords="Number(totalRecords) || 0"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Đang hiển thị {first} - {last} từ {totalRecords} sản phẩm"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters.global.value" placeholder="Tìm theo tên sản phẩm..." @input="onSearch" />
                        </IconField>
                        <div class="space-x-2">
                            <Button label="New" icon="pi pi-plus" @click="openNew" />
                            <Button label="Xuất CSV" icon="pi pi-upload" @click="exportCSV($event)" />
                            <Button label="Xóa" icon="pi pi-trash" :disabled="!selectedProducts.length" @click="confirmDeleteSelected" />
                        </div>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem"></Column>
                <Column header="Ảnh sản phẩm" field="thumbnail">
                    <template #body="slotProps">
                        <img :src="`https://primefaces.org/cdn/primevue/images/product/${slotProps.data.thumbnail}`" :alt="slotProps.data.thumbnail" class="rounded" style="width: 64px" />
                    </template>
                </Column>
                <Column field="name" header="Tên sản phẩm" sortable></Column>
                <Column field="price" header="Giá" sortable></Column>
                <Column field="collectionId" header="Bộ sưu tập" sortable></Column>
                <Column field="status" header="Trạng thái" sortable></Column>
                <Column field="updatedAt" header="Cập nhật lúc" sortable></Column>
                <Column field="updatedBy" header="Cập nhật bởi" sortable></Column>
                <Column :exportable="false" style="min-width: 12rem" header="Hành động">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" class="mr-2" @click="editProduct(slotProps.data)" />
                        <Button icon="pi pi-trash" class="text-red-500" @click="confirmDeleteProduct(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Dialog tạo mới sản phẩm -->
        <Dialog v-model:visible="productDialog" header="Tạo mới sản phẩm" :modal="true" :closable="true" :style="{ width: '1500px' }">
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
                    <FileUpload ref="fileupload" mode="basic" name="demo[]" accept="image/*" :maxFileSize="1000000" @uploader="onUpload" customUpload />
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
                    <FileUpload name="images" @uploader="onUpload" :multiple="true" accept="image/*" :maxFileSize="1000000" customUpload />
                    <Button label="Upload" @click="upload" severity="secondary" />
                </div>
                <div class="mb-4">
                    <label class="block font-semibold">Bộ sưu tập</label>
                    <Dropdown v-model="product.collectionId" :options="collections" optionLabel="name" class="w-full" />
                </div>
                <div class="mb-4">
                    <label class="block font-semibold">Trạng thái</label>
                    <Dropdown v-model="product.status" :options="statusOptions" optionLabel="label" class="w-full" />
                </div>
                <div class="mb-4">
                    <label class="block font-semibold">Thẻ (Tags)</label>
                    <Tag v-model="product.tags" class="w-full" />
                </div>
                <div class="mb-4">
                    <label class="block font-semibold">Số lượng đã bán</label>
                    <InputNumber v-model="product.soldAmount" :min="0" class="w-full" />
                </div>
                <div class="mb-4">
                    <label class="block font-semibold">Lượt truy cập</label>
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
                    <HyperTextEditor v-model="product.description" />
                </div>

                <div class="flex justify-end gap-2">
                    <Button label="Hủy" icon="pi pi-times" class="p-button-text" @click="productDialog = false" />
                    <Button label="Lưu" icon="pi pi-check" class="p-button-primary" @click="saveProduct" />
                </div>
            </div>
        </Dialog>

        <!-- Dialog xác nhận xóa sản phẩm -->
        <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Xác nhận xóa" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="product"
                    >Bạn có chắc chắn muốn xóa <b>{{ product.name }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="Không" icon="pi pi-times" text @click="deleteProductDialog = false" />
                <Button label="Có" icon="pi pi-check" @click="deleteProduct(product.id)" />
            </template>
        </Dialog>

        <!-- Dialog xác nhận xóa nhiều sản phẩm -->
        <Dialog v-model:visible="deleteSelectedProductsDialog" :style="{ width: '450px' }" header="Xác nhận xóa" :modal="true">
            <div>
                <div class="flex items-center gap-4 mb-4">
                    <i class="pi pi-exclamation-triangle !text-3xl" />
                    <span>Bạn có chắc chắn muốn xóa các sản phẩm sau?</span>
                </div>
                <ul>
                    <li v-for="product in selectedProducts" :key="product.id">{{ product.name }}</li>
                </ul>
            </div>
            <template #footer>
                <Button label="Không" icon="pi pi-times" text @click="deleteSelectedProductsDialog = false" />
                <Button label="Có" icon="pi pi-check" @click="deleteSelectedProducts" />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { collection, query, updateDoc, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebaseConfig'; // Đường dẫn tới file cấu hình firebase của bạn
import HyperTextEditor from '@/components/Sample/HyperTextEditor.vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const submitted = ref(false);
const loading = ref(false);
const products = ref([]);
const selectedProducts = ref([]);
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteSelectedProductsDialog = ref(false);
const product = ref({});
const filters = ref({ global: { value: '' } });
const pageSize = ref(10);
const currentPage = ref(0);
const totalRecords = ref(0);
const collections = ref([
    { id: 'podsystem', name: 'Podsystem' },
    { id: 'vape-box', name: 'Vape Box' },
    { id: 'freebase', name: 'Freebase' },
    { id: 'occ-coil', name: 'Occ Coil' },
    { id: 'pod-head', name: 'Pod Head' },
    { id: 'saltnic', name: 'Saltnic' }
]); // Thêm bộ sưu tập thực tế của bạn ở đây
const statusOptions = ref([
    { label: 'Còn hàng', value: 'in_stock' },
    { label: 'Hết hàng', value: 'out_of_stock' }
]);

const brands = ref([
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
]);

// Hàm tìm kiếm
const onSearch = () => {
    getPaginatedProducts();
};

// Hàm lấy danh sách sản phẩm theo phân trang
const getPaginatedProducts = async () => {
    const q = query(collection(db, 'products'));
    const querySnapshot = await getDocs(q);
    products.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    totalRecords.value = products.value.length;
};

const saveProduct = async () => {
    const data = { ...product.value, collectionId: product.value.collectionId.id, status: product.value.status.value };

    if (product.value.id) {
        // Cập nhật sản phẩm
        await updateDoc(doc(db, 'products', product.value.id), data);
    } else {
        // Tạo sản phẩm mới
        await addDoc(collection(db, 'products'), data);
    }
    productDialog.value = false;
    getPaginatedProducts();
};

// Hàm xóa sản phẩm
const deleteProduct = async (id) => {
    await deleteDoc(doc(db, 'products', id));
    deleteProductDialog.value = false;
    getPaginatedProducts();
};

// Hàm xóa các sản phẩm đã chọn
const deleteSelectedProducts = async () => {
    for (const selected of selectedProducts.value) {
        await deleteProduct(selected.id);
    }
    deleteSelectedProductsDialog.value = false;
};

// Hàm chỉnh sửa sản phẩm
const editProduct = (selectedProduct) => {
    productDialog.value = true;
    product.value = { ...selectedProduct };
};

// Hàm xác nhận xóa sản phẩm
const confirmDeleteProduct = (selectedProduct) => {
    deleteProductDialog.value = true;
    product.value = { ...selectedProduct };
};

// Hàm xác nhận xóa nhiều sản phẩm
const confirmDeleteSelected = () => {
    deleteSelectedProductsDialog.value = true;
};

function openNew() {
    product.value = {};
    submitted.value = false;
    productDialog.value = true;
}

function onUpload() {
    toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
}

const fileupload = ref();
</script>
