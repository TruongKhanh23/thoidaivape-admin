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
                        <div class="space-x-2">
                            <Button v-if="canCreateCollection" label="Tạo mới" icon="pi pi-plus" @click="openNew" />
                            <Button label="Xuất CSV" icon="pi pi-upload" @click="exportCSV($event)" />
                        </div>
                    </div>
                </template>

                <Column field="name" header="Tên bộ sưu tập" sortable style="min-width: 16rem"></Column>
                <Column field="description" header="Mô tả chi tiết" sortable style="min-width: 16rem">
                    <template #body="slotProps"><span class="line-clamp-1" v-html="slotProps.data.description"></span></template
                ></Column>
                <Column field="updatedAt" header="Cập nhật lúc" sortable style="min-width: 16rem">
                    <template #body="slotProps">
                        {{ formatDate(slotProps.data.updatedAt) }}
                    </template>
                </Column>
                <Column field="updatedBy" header="Cập nhật bởi" sortable></Column>
                <Column v-if="canUpdateCollection" :exportable="false" style="min-width: 12rem" header="Hành động">
                    <template #body="slotProps">
                        <Button v-if="canUpdateCollection" icon="pi pi-pencil" class="mr-2" @click="editCollectionDetails(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>

            <Dialog v-model:visible="collectionDialog" :style="{ width: '450px' }" header="Chỉnh sửa bộ sưu tập" :modal="true">
                <div class="flex flex-col gap-6">
                    <div>
                        <label for="name" class="block font-bold mb-3">Tên bộ sưu tập</label>
                        <InputText id="name" v-model.trim="collection.name" required="true" autofocus :disabled="isDisabled" />
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
        </div>
    </div>
</template>

<script setup>
import { getPaginatedCollections, saveCollection } from '@/composables/collection';
import { formatDate } from '@/utils';
import { FilterMatchMode } from '@primevue/core/api';
import { onMounted, ref, computed } from 'vue';
import { checkAccountRights } from '@/composables/authentication';

const canCreateCollection = computed(() => checkAccountRights('create_collection'));
const canUpdateCollection = computed(() => checkAccountRights('update_collection'));

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
const isDisabled = ref(false);

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

// Initial Load
onMounted(fetchCollections);
</script>
