<template>
    <div>
        <div class="card">
            <div class="font-semibold text-xl">Danh sách khách hàng</div>
            <DataTable ref="dt" v-model:selection="selectedUsers" :value="users" :loading="loading" dataKey="id"
                :paginator="true" :rows="pageSize" :totalRecords="totalRecords" :first="currentPage * pageSize"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Đang hiển thị {first} - {last} từ {totalRecords} khách hàng"
                @page="onPageChange">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Tìm kiếm..."
                                @input="onFilterChange" />
                        </IconField>
                        <Button label="Xuất CSV" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                    </div>
                </template>

                <Column field="fullName" header="Họ và tên" sortable style="min-width: 16rem"></Column>
                <Column field="email" header="Email" sortable style="min-width: 20rem"></Column>
                <Column field="phoneNumber" header="Số điện thoại" sortable style="min-width: 15rem"></Column>
                <Column field="provider" header="Loại tài khoản" sortable style="min-width: 10rem"></Column>
            </DataTable>
        </div>
    </div>
</template>

<script setup>
import { getPaginatedUsers } from '@/service/firestoreService';
import { FilterMatchMode } from '@primevue/core/api';
import { onMounted, ref } from 'vue';

// Variables
const dt = ref();
const users = ref([]);
const selectedUsers = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const loading = ref(false);
const currentPage = ref(0);
const pageSize = ref(10);
const totalRecords = ref(0);

// Functions
async function fetchUsers() {
    loading.value = true;
    const { users: data, total } = await getPaginatedUsers(currentPage.value, pageSize.value, filters.value.global.value);
    users.value = data;
    totalRecords.value = total;
    loading.value = false;
}

function onPageChange(event) {
    currentPage.value = event.page;
    pageSize.value = event.rows;
    fetchUsers();
}

function onFilterChange() {
    currentPage.value = 0;
    fetchUsers();
}

function exportCSV() {
    dt.value.exportCSV();
}

// Initial Load
onMounted(fetchUsers);
</script>
