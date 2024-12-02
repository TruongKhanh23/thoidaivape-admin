<template>
    <div>
        <div class="card">
            <div class="font-semibold text-xl">Danh sách bộ sưu tập</div>
            <DataTable
                ref="dtCollections"
                v-model:selection="selectedCollections"
                :value="collections"
                :loading="loading"
                dataKey="id"
                :paginator="true"
                :rows="pageSize"
                :totalRecords="totalRecords"
                :first="currentPage * pageSize"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[1, 5, 10, 25]"
                currentPageReportTemplate="Đang hiển thị {first} - {last} từ {totalRecords} bộ sưu tập"
                @page="onPageChange"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Tìm theo tên..." @input="onFilterChange" />
                        </IconField>
                        <div class="space-x-2">
                            <Button v-if="canCreateCollection" label="Tạo mới" icon="pi pi-plus" @click="openNew" />
                            <Button label="Xuất Excel" icon="pi pi-upload" @click="exportCSV($event)" />
                        </div>
                    </div>
                </template>

                <Column field="name" header="Tên bộ sưu tập" sortable style="min-width: 12rem"></Column>
                <Column field="orderNumber" header="Thứ tự" sortable style="min-width: 12rem"> ></Column>
                <Column field="updatedAt" header="Cập nhật lúc" sortable style="min-width: 12rem">
                    <template #body="slotProps">
                        {{ formatDate(slotProps.data.updatedAt) }}
                    </template>
                </Column>
                <Column field="updatedBy" header="Cập nhật bởi" sortable style="min-width: 4rem"></Column>
                <Column v-if="canUpdateCollection" :exportable="false" style="min-width: 6rem" header="Hành động">
                    <template #body="slotProps">
                        <Button v-if="canUpdateCollection" icon="pi pi-pencil" class="mr-2" @click="editCollectionDetails(slotProps.data)" />
                        <Button v-if="canDeleteCollection" icon="pi pi-trash" class="text-red-500" @click="confirmDeleteCollection(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>

            <Dialog v-model:visible="collectionDialog" :style="{ width: '450px' }" header="Chỉnh sửa bộ sưu tập" :modal="true">
                <div class="flex flex-col gap-6">
                    <div>
                        <label for="name" class="block font-bold mb-3">Tên bộ sưu tập</label>
                        <InputText id="name" v-model.trim="collection.name" required="true" autofocus :disabled="isDisabled" fluid />
                    </div>

                    <div>
                        <label for="children" class="block font-bold mb-3">Loại</label>
                        <Dropdown v-model="collection.type" :options="collectionTypes" optionLabel="name" placeholder="Chọn loại bộ sưu tập" :filter="true" class="w-full max-w-full" />
                    </div>

                    <div v-if="collection.type && collection.type.id == 'parrent'">
                        <label for="children" class="block font-bold mb-3">Bộ sưu tập con</label>
                        <MultiSelect v-model="collection.childrens" :options="collections.filter((item) => item.id != collection.id)" optionLabel="name" placeholder="Chọn bộ sưu tập con" :filter="true" class="w-full max-w-full" />
                    </div>

                    <div>
                        <label for="orderNumber" class="block font-bold mb-3">Thứ tự</label>
                        <InputNumber id="orderNumber" v-model="collection.orderNumber" required="true" fluid />
                    </div>

                    <div class="mb-4">
                        <label for="collection-description" class="block font-semibold">Mô tả chi tiết</label>
                        <RichTextEditor idPrefix="collection-description" @richTextUpdated="handleUpdateRichText" v-model="collection.description" :initialContent="collection.description" />
                    </div>

                    <div v-if="isDisabled">
                        <div class="grid grid-cols-12 gap-4">
                            <div class="col-span-6">
                                <label for="createdAt" class="block font-bold mb-3">Ngày tạo</label>
                                <InputText id="createdAt" :value="formatDate(collection.createdAt)" :disabled="isDisabled" fluid />
                            </div>
                            <div class="col-span-6">
                                <label for="createdBy" class="block font-bold mb-3">Tạo bởi</label>
                                <InputText id="createdBy" v-model.trim="collection.createdBy" :disabled="isDisabled" fluid />
                            </div>
                        </div>
                        <div class="grid grid-cols-12 gap-4">
                            <div class="col-span-6">
                                <label for="updatedAt" class="block font-bold mb-3">Ngày cập nhật</label>
                                <InputText id="updatedAt" :value="formatDate(collection.updatedAt)" :disabled="isDisabled" fluid />
                            </div>
                            <div class="col-span-6">
                                <label for="updatedBy" class="block font-bold mb-3">Cập nhật bởi</label>
                                <InputText id="updatedBy" v-model.trim="collection.updatedBy" :disabled="isDisabled" fluid />
                            </div>
                        </div>
                    </div>
                </div>
                <template #footer>
                    <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                    <Button label="Save" icon="pi pi-check" @click="handleSaveCollection" />
                </template>
            </Dialog>

            <Dialog v-model:visible="deleteCollectionDialog" :style="{ width: '450px' }" :header="messageDenyDeleteCollection ? 'Không thể xóa' : 'Xác nhận xóa'" :modal="true">
                <div class="flex items-center gap-4">
                    <i class="pi pi-exclamation-triangle !text-3xl" />
                    <span v-if="collection && !messageDenyDeleteCollection"
                        >Bạn có chắc chắn muốn xóa <b>{{ collection.name }}</b
                        >?</span
                    >
                    <span v-else-if="messageDenyDeleteCollection">
                        {{ messageDenyDeleteCollection }}
                    </span>
                </div>
                <template #footer v-if="!messageDenyDeleteCollection">
                    <Button label="Không" icon="pi pi-times" text @click="deleteCollectionDialog = false" />
                    <Button label="Có" icon="pi pi-check" @click="agreeDeleteCollection(collection)" />
                </template>
            </Dialog>
        </div>
    </div>
</template>

<script setup>
import { getPaginatedCollections, saveCollection, removeCollection, getTotalProductsByCollection } from '@/composables/collection';
import { formatDate } from '@/utils';
import { FilterMatchMode } from '@primevue/core/api';
import { onMounted, ref, computed } from 'vue';
import { checkAccountRights } from '@/composables/authentication';

const canCreateCollection = computed(() => checkAccountRights('create_collection'));
const canUpdateCollection = computed(() => checkAccountRights('update_collection'));
const canDeleteCollection = computed(() => checkAccountRights('delete_collection'));

// Variables
const dtCollections = ref();
const collection = ref();
const collections = ref([]);
const collectionDialog = ref(false);
const deleteCollectionDialog = ref(false);
const messageDenyDeleteCollection = ref('');
const selectedCollections = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const loading = ref(false);
const currentPage = ref(0);
const pageSize = ref(10); // Set page size to 1 for testing pagination
const totalRecords = ref(0);
const lastVisible = ref(null); // Store last visible document for pagination
const description = ref();
const isDisabled = ref(false);

const collectionTypes = ref([
    { id: 'parrent', name: 'Bộ sưu tập cha' },
    { id: 'children', name: 'Bộ sưu tập con' }
]);

// Functions
const fetchCollections = async () => {
    loading.value = true;
    try {
        collections.value = await getPaginatedCollections('cache');
    } catch (error) {
        collections.value = await getPaginatedCollections('server');
    }
    totalRecords.value = collections.value.length;
    loading.value = false;
};

// Hàm thay đổi filter và gọi lại fetchCollections
function onFilterChange() {
    currentPage.value = 0; // Reset lại trang hiện tại
    fetchCollections(); // Gọi lại fetchCollections khi có thay đổi bộ lọc
}

// Hàm xử lý thay đổi phân trang
function onPageChange(event) {
    currentPage.value = event.page;
    pageSize.value = event.rows;
    // Đảm bảo lastVisible được reset khi thay đổi trang
    lastVisible.value = null;
    fetchCollections(); // Gọi lại fetchCollections khi thay đổi trang
}

function editCollectionDetails(value) {
    isDisabled.value = true;
    collection.value = { ...value, createdAt: value.createdAt, updatedAt: value.updatedAt };
    collectionDialog.value = true;
}

function exportCSV() {
    dtCollections.value.exportCSV();
}

function handleUpdateRichText(content) {
    description.value = content;
}

function openNew() {
    isDisabled.value = false;
    collection.value = {};
    collectionDialog.value = true;
}

function hideDialog() {
    collectionDialog.value = false;
}

async function handleSaveCollection() {
    hideDialog();
    loading.value = true;
    await saveCollection(collection.value, description.value);
    await fetchCollections();
    loading.value = false;
}

const confirmDeleteCollection = async (selectedCollection) => {
    const totalProductsByCollection = await getTotalProductsByCollection(selectedCollection);
    deleteCollectionDialog.value = true;
    if (totalProductsByCollection) {
        messageDenyDeleteCollection.value = `Hiện tại còn ${totalProductsByCollection} sản phẩm đang được gán tới bộ sưu tập "${selectedCollection.name}". ` + `Hãy xóa tất cả sản phẩm đó trước khi xóa bộ sưu tập này.`;
    } else {
        messageDenyDeleteCollection.value = '';
        collection.value = { ...selectedCollection };
    }
};

const agreeDeleteCollection = async (selectedCollection) => {
    try {
        await removeCollection(selectedCollection);
        deleteCollectionDialog.value = false;
        fetchCollections();
    } catch (error) {
        console.log('Error:', error);
    }
};

// Initial Load
onMounted(fetchCollections);
</script>
<style>
.p-datatable-table {
    border-color: rgba(128, 128, 128, 0) !important;
}
/* Chế độ tối */
.app-dark .p-datatable-table {
    background-color: rgba(0, 0, 0, 0) !important;
}
</style>
