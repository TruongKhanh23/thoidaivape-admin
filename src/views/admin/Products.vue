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
                            <Button label="Xuất CSV" icon="pi pi-upload" @click="exportCSV($event)" />
                            <Button label="Xóa" icon="pi pi-trash" :disabled="!selectedProducts.length" @click="confirmDeleteSelected" />
                        </div>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem"></Column>
                <Column header="Ảnh sản phẩm" field="thumbnail" style="min-width: 9rem">
                    <template #body="slotProps">
                        <img :src="`${slotProps.data.thumbnail}`" :alt="slotProps.data.thumbnail" class="rounded" style="width: 64px" />
                    </template>
                </Column>
                <Column field="name" header="Tên sản phẩm" sortable style="min-width: 10rem"></Column>
                <Column field="price" header="Giá" sortable style="min-width: 8rem">
                    <template #body="slotProps">
                        {{ formatCurrency(slotProps.data.price) }}
                    </template>
                </Column>
                <Column field="collection.name" header="Bộ sưu tập" sortable style="min-width: 9rem"></Column>
                <Column field="status.name" header="Trạng thái" sortable style="min-width: 9rem"></Column>
                <Column field="updatedAt" header="Cập nhật lúc" sortable style="min-width: 5rem">
                    <template #body="slotProps">
                        {{ formatDate(slotProps.data.updatedAt) }}
                    </template>
                </Column>
                <Column field="updatedBy" header="Cập nhật bởi" sortable></Column>
                <Column :exportable="false" style="min-width: 8rem" header="Hành động">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" class="mr-2" @click="editProduct(slotProps.data)" />
                        <Button icon="pi pi-trash" class="text-red-500" @click="confirmDeleteProduct(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

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
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebaseConfig'; // Đường dẫn tới file cấu hình firebase của bạn
import { formatDate } from '@/utils';
import router from '@/router';

const loading = ref(false);
const products = ref([]);
const selectedProducts = ref([]);
const deleteProductDialog = ref(false);
const deleteSelectedProductsDialog = ref(false);
const product = ref({});
const filters = ref({ global: { value: '' } });
const pageSize = ref(10);
const currentPage = ref(0);
const totalRecords = ref(0);

// Hàm tìm kiếm
const onSearch = () => {
    getPaginatedProducts();
};

// Hàm lấy danh sách sản phẩm theo phân trang
const getPaginatedProducts = async () => {
    const q = query(collection(db, 'products'));
    const querySnapshot = await getDocs(q);
    products.value = querySnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
    });
    console.log("products.value", products.value);

    totalRecords.value = products.value.length;
};

getPaginatedProducts();

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
    router.push({ name: 'product-action', params: { action: 'update', id: selectedProduct.id } });
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

function formatCurrency(value) {
    if (value) {
        // Format giá trị thành chuỗi số có dấu phẩy
        const formattedValue = new Intl.NumberFormat('vi-VN').format(value);
        // Thêm chữ "đ" ở cuối
        return `${formattedValue} đ`;
    }
    return '0 đ'; // Xử lý trường hợp giá trị không hợp lệ
}
</script>
