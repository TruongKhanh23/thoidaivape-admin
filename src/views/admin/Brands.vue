<template>
    <div>
        <div class="card">
            <div class="font-semibold text-xl">Danh sách thương hiệu</div>
            <DataTable
                ref="dtBrands"
                v-model:selection="selectedBrands"
                :value="brands"
                :paginator="true"
                :loading="loading"
                :rows="pageSize"
                dataKey="id"
                :filters="filters"
                :first="currentPage * pageSize"
                :totalRecords="Number(totalRecords) || 0"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Đang hiển thị {first} - {last} từ {totalRecords} thương hiệu"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters.global.value" placeholder="Tìm theo tên..." @input="onSearch" />
                        </IconField>
                        <div class="space-x-2">
                            <Button v-if="canCreateBrand" label="Tạo hàng loạt" icon="pi pi-plus" @click="handleCreateDummyBrands" />
                            <Button v-if="canCreateBrand" label="Tạo mới" icon="pi pi-plus" @click="openNew" />
                            <Button label="Xuất Excel" icon="pi pi-upload" @click="exportCSV($event)" />
                            <Button v-if="canDeleteBrand" label="Xóa" icon="pi pi-trash" :disabled="!selectedBrands.length" @click="confirmDeleteSelected" />
                        </div>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem"></Column>
                <Column field="name" header="Tên thương hiệu" sortable style="min-width: 10rem"></Column>
                <Column field="createdAt" header="Tạo lúc" sortable style="min-width: 5rem">
                    <template #body="slotProps">
                        {{ formatDate(slotProps.data.createdAt) }}
                    </template>
                </Column>
                <Column field="updatedAt" header="Cập nhật lúc" sortable style="min-width: 5rem">
                    <template #body="slotProps">
                        {{ formatDate(slotProps.data.updatedAt) }}
                    </template>
                </Column>
                <Column field="updatedBy" header="Cập nhật bởi" sortable></Column>
                <Column v-if="canUpdateBrand || canDeleteBrand" :exportable="false" style="min-width: 6rem" header="Hành động">
                    <template #body="slotProps">
                        <Button v-if="canUpdateBrand" icon="pi pi-pencil" class="mr-2" @click="editBrandDetails(slotProps.data)" />
                        <Button v-if="canDeleteBrand" icon="pi pi-trash" class="text-red-500" @click="confirmDeleteBrand(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="brandDialog" :style="{ width: '450px' }" :header="`${action} thương hiệu`" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="name" class="block font-bold mb-3">Tên thương hiệu</label>
                    <InputText id="name" v-model.trim="brand.name" required="true" autofocus :disabled="isDisabled" fluid />
                </div>

                <div v-if="isDisabled">
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-6">
                            <label for="createdAt" class="block font-bold mb-3">Ngày tạo</label>
                            <InputText id="createdAt" :value="formatDate(brand.createdAt)" :disabled="isDisabled" fluid />
                        </div>
                        <div class="col-span-6">
                            <label for="createdBy" class="block font-bold mb-3">Tạo bởi</label>
                            <InputText id="createdBy" v-model.trim="brand.createdBy" :disabled="isDisabled" fluid />
                        </div>
                    </div>
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-6">
                            <label for="updatedAt" class="block font-bold mb-3">Ngày cập nhật</label>
                            <InputText id="updatedAt" :value="formatDate(brand.updatedAt)" :disabled="isDisabled" fluid />
                        </div>
                        <div class="col-span-6">
                            <label for="updatedBy" class="block font-bold mb-3">Cập nhật bởi</label>
                            <InputText id="updatedBy" v-model.trim="brand.updatedBy" :disabled="isDisabled" fluid />
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <Button label="Hủy" icon="pi pi-times" text @click="hideDialog" />
                <Button :label="action" icon="pi pi-check" @click="handleSaveBrand" />
            </template>
        </Dialog>

        <!-- Dialog xác nhận xóa thương hiệu -->
        <Dialog v-model:visible="deleteBrandDialog" :style="{ width: '450px' }" header="Xác nhận xóa" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="brand"
                    >Bạn có chắc chắn muốn xóa <b>{{ brand.name }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="Không" icon="pi pi-times" text @click="deleteBrandDialog = false" />
                <Button label="Có" icon="pi pi-check" @click="deleteBrand(brand.id)" />
            </template>
        </Dialog>

        <!-- Dialog xác nhận xóa nhiều thương hiệu -->
        <Dialog v-model:visible="deleteSelectedBrandsDialog" :style="{ width: '450px' }" header="Xác nhận xóa" :modal="true">
            <div>
                <div class="flex items-center gap-4 mb-4">
                    <i class="pi pi-exclamation-triangle !text-3xl" />
                    <span>Bạn có chắc chắn muốn xóa các thương hiệu sau?</span>
                </div>
                <ul>
                    <li v-for="brand in selectedBrands" :key="brand.id">{{ brand.name }}</li>
                </ul>
            </div>
            <template #footer>
                <Button label="Không" icon="pi pi-times" text @click="deleteSelectedBrandsDialog = false" />
                <Button label="Có" icon="pi pi-check" @click="deleteSelectedBrands" />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebaseConfig'; // Đường dẫn tới file cấu hình firebase của bạn
import { formatDate } from '@/utils';
import { checkAccountRights } from '@/composables/rights';
import { createDummyBrands } from '@/composables/dummy/brand';
import { saveBrand, getPaginatedBrands } from '@/composables/brand';

const canCreateBrand = computed(() => checkAccountRights('create_brand'));
const canUpdateBrand = computed(() => checkAccountRights('update_brand'));
const canDeleteBrand = computed(() => checkAccountRights('delete_brand'));

const dtBrands = ref();
const loading = ref(false);
const brands = ref([]);
const action = ref('');
const selectedBrands = ref([]);
const brandDialog = ref(false);
const deleteBrandDialog = ref(false);
const deleteSelectedBrandsDialog = ref(false);
const brand = ref({});
const filters = ref({ global: { value: '' } });
const pageSize = ref(10);
const currentPage = ref(0);
const totalRecords = ref(0);
const isDisabled = ref(false);

// Hàm tìm kiếm
const onSearch = () => {
    fetchPaginatedBrands();
};

// Hàm lấy danh sách thương hiệu theo phân trang
const fetchPaginatedBrands = async () => {
    loading.value = true;
    try {
        brands.value = await getPaginatedBrands('cache');
    } catch (error) {
        brands.value = await getPaginatedBrands('server');
    }
    totalRecords.value = brands.value.length;
    loading.value = false;
};

fetchPaginatedBrands();

// Hàm xóa thương hiệu
const deleteBrand = async (id) => {
    await deleteDoc(doc(db, 'brands', id));
    deleteBrandDialog.value = false;
    fetchPaginatedBrands();
};

// Hàm xóa các thương hiệu đã chọn
const deleteSelectedBrands = async () => {
    for (const selected of selectedBrands.value) {
        await deleteBrand(selected.id);
    }
    deleteSelectedBrandsDialog.value = false;
};

// Hàm xác nhận xóa thương hiệu
const confirmDeleteBrand = (selectedBrand) => {
    deleteBrandDialog.value = true;
    brand.value = { ...selectedBrand };
};

// Hàm xác nhận xóa nhiều thương hiệu
const confirmDeleteSelected = () => {
    deleteSelectedBrandsDialog.value = true;
};

function hideDialog() {
    brandDialog.value = false;
}

function openNew() {
    action.value = 'Tạo';
    isDisabled.value = false;
    brand.value = {};
    brandDialog.value = true;
}

function editBrandDetails(value) {
    action.value = 'Cập nhật';
    brand.value = { ...value, createdAt: value.createdAt, updatedAt: value.updatedAt };
    brandDialog.value = true;
}

async function handleSaveBrand() {
    await saveBrand(brand.value);
    hideDialog();
    fetchPaginatedBrands();
}

function exportCSV() {
    dtBrands.value.exportCSV();
}

async function handleCreateDummyBrands() {
    await createDummyBrands();
    hideDialog();
    fetchPaginatedBrands();
}
</script>
