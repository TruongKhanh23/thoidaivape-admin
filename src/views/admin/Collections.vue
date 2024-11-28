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
                            <InputText v-model="filters['global'].value" placeholder="Tìm kiếm..." @input="onFilterChange" />
                        </IconField>
                        <Button label="Xuất CSV" icon="pi pi-upload" @click="exportCSV($event)" />
                    </div>
                </template>

                <Column field="name" header="Tên bộ sưu tập" sortable style="min-width: 16rem"></Column>
                <Column field="description" header="Mô tả chi tiết" sortable style="min-width: 16rem">
                    <template #body="slotProps">
                        <span class="line-clamp-1">{{ slotProps.data.description }}</span>
                    </template></Column
                >
                <Column field="updatedAt" header="Cập nhật lúc" sortable style="min-width: 16rem">
                    <template #body="slotProps">
                        {{ formatDate(slotProps.data.updatedAt) }}
                    </template>
                </Column>
                <Column field="updatedBy" header="Cập nhật bởi" sortable></Column>
                <Column :exportable="false" style="min-width: 12rem" header="Hành động">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editCollectionDetails(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>

            <Dialog v-model:visible="collectionDialog" :style="{ width: '450px' }" header="Chỉnh sửa bộ sưu tập" :modal="true">
                <div class="flex flex-col gap-6">
                    <div>
                        <label for="name" class="block font-bold mb-3">Tên bộ sưu tập</label>
                        <InputText id="name" v-model.trim="collection.name" required="true" autofocus />
                    </div>

                    <div class="mb-4">
                        <label for="collection-description" class="block font-semibold">Mô tả chi tiết</label>
                        <RichTextEditor idPrefix="collection-description" @richTextUpdated="handleUpdateRichText" v-model="collection.description" :initialContent="collection.description" />
                    </div>

                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-6">
                            <label for="createdAt" class="block font-bold mb-3">Ngày tạo</label>
                            <InputText id="createdAt" v-model.trim="collection.createdAt" disabled fluid />
                        </div>
                        <div class="col-span-6">
                            <label for="createdBy" class="block font-bold mb-3">Tạo bởi</label>
                            <InputText id="createdBy" v-model.trim="collection.createdBy" disabled fluid />
                        </div>
                    </div>
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-6">
                            <label for="updatedAt" class="block font-bold mb-3">Ngày cập nhật</label>
                            <InputText id="updatedAt" v-model.trim="collection.updatedAt" disabled fluid />
                        </div>
                        <div class="col-span-6">
                            <label for="updatedBy" class="block font-bold mb-3">Cập nhật bởi</label>
                            <InputText id="updatedBy" v-model.trim="collection.updatedBy" disabled fluid />
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    </div>
</template>

<script setup>
import { getPaginatedCollections } from '@/composables/collection';
import { formatDate } from '@/utils';
import { FilterMatchMode } from '@primevue/core/api';
import { onMounted, ref } from 'vue';
// Variables
const dtCollections = ref();
const collection = ref();
const collections = ref([]);
const collectionDialog = ref(false);
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

// Functions
async function fetchCollections() {
    loading.value = true;
    const { collections: data, lastVisible: newLastVisible, totalRecords: total } = await getPaginatedCollections(lastVisible.value, 50, filters.value.global.value);
    collections.value = data;
    lastVisible.value = newLastVisible; // Update lastVisible for next page
    totalRecords.value = total;
    loading.value = false;
}

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
    collection.value = { ...value, createdAt: formatDate(value.createdAt.toDate()), updatedAt: formatDate(value.updatedAt.toDate()) };
    collectionDialog.value = true;
}

function exportCSV() {
    dtCollections.value.exportCSV();
}

function handleUpdateRichText(content) {
    description.value = content;
}

// Initial Load
onMounted(fetchCollections);
</script>
