<template>
    <div>
        <div class="card">
            <div class="font-semibold text-xl">Danh sách khách hàng</div>
            <DataTable
                ref="dtUsers"
                v-model:selection="selectedUsers"
                :value="users"
                :loading="loading"
                dataKey="id"
                :paginator="true"
                :rows="pageSize"
                :totalRecords="totalRecords"
                :first="currentPage * pageSize"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[1, 5, 10, 25]"
                currentPageReportTemplate="Đang hiển thị {first} - {last} từ {totalRecords} khách hàng"
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

                <Column field="displayName" header="Họ và tên" sortable style="min-width: 16rem"></Column>
                <Column field="email" header="Email" sortable style="min-width: 20rem"></Column>
                <Column field="phoneNumber" header="Số điện thoại" sortable style="min-width: 15rem"></Column>
                <Column field="provider" header="Loại tài khoản" sortable style="min-width: 10rem"></Column>
                <Column :exportable="false" style="min-width: 12rem" header="Hành động">
                    <template #body="slotProps">
                        <Button icon="pi pi-eye" class="mr-2" @click="viewUserDetails(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>

            <Dialog v-model:visible="userDialog" :style="{ width: '450px' }" header="Thông tin chi tiết" :modal="true">
                <div class="flex flex-col gap-6">
                    <div>
                        <label for="displayName" class="block font-bold mb-3">Họ và tên</label>
                        <InputText id="displayName" v-model.trim="user.displayName" required="true" autofocus disabled fluid />
                    </div>

                    <div>
                        <label for="email" class="block font-bold mb-3">Email</label>
                        <InputText id="email" v-model.trim="user.email" required="true" disabled fluid />
                    </div>

                    <div>
                        <label for="phoneNumber" class="block font-bold mb-3">Số điện thoại</label>
                        <InputText id="phoneNumber" v-model.trim="user.phoneNumber" required="true" disabled fluid />
                    </div>

                    <div>
                        <label for="address" class="block font-bold mb-3">Địa chỉ</label>
                        <Textarea id="address" v-model.trim="user.address" disabled fluid />
                    </div>

                    <div>
                        <label for="provider" class="block font-bold mb-3">Provider</label>
                        <InputText id="provider" v-model.trim="user.provider" disabled fluid />
                    </div>

                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-6">
                            <label for="createdDate" class="block font-bold mb-3">Ngày tạo</label>
                            <InputText id="createdDate" v-model.trim="user.createdDate" disabled fluid />
                        </div>
                        <div class="col-span-6">
                            <label for="modifiedDate" class="block font-bold mb-3">Ngày cập nhật</label>
                            <InputText id="modifiedDate" v-model.trim="user.modifiedDate" disabled fluid />
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    </div>
</template>

<script setup>
import { getPaginatedUsers } from '@/composables/users';
import { formatDate } from '@/utils';
import { FilterMatchMode } from '@primevue/core/api';
import { onMounted, ref } from 'vue';
// Variables
const dtUsers = ref();
const user = ref();
const users = ref([]);
const userDialog = ref(false);
const selectedUsers = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const loading = ref(false);
const currentPage = ref(0);
const pageSize = ref(10); // Set page size to 1 for testing pagination
const totalRecords = ref(0);
const lastVisible = ref(null); // Store last visible document for pagination

// Functions
const fetchUsers = async () => {
    loading.value = true;
    users.value = await getPaginatedUsers();
    totalRecords.value = users.value.length;
    //loading.value = false;
};

// Hàm thay đổi filter và gọi lại fetchUsers
function onFilterChange() {
    currentPage.value = 0; // Reset lại trang hiện tại
    fetchUsers(); // Gọi lại fetchUsers khi có thay đổi bộ lọc
}

// Hàm xử lý thay đổi phân trang
function onPageChange(event) {
    currentPage.value = event.page;
    pageSize.value = event.rows;
    // Đảm bảo lastVisible được reset khi thay đổi trang
    lastVisible.value = null;
    fetchUsers(); // Gọi lại fetchUsers khi thay đổi trang
}

function viewUserDetails(value) {
    user.value = { ...value, createdDate: formatDate(value.createdDate.toDate()), modifiedDate: formatDate(value.modifiedDate.toDate()) };
    userDialog.value = true;
}

function exportCSV() {
    dtUsers.value.exportCSV();
}

// Initial Load
onMounted(fetchUsers);
</script>
