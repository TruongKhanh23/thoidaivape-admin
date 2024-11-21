<template>
    <div>
        <div class="card">
            <div class="font-semibold text-xl">Danh sách quản trị viên</div>
            <DataTable
                ref="dt"
                v-model:selection="selectedAccounts"
                :value="accounts"
                :paginator="true"
                :loading="loading"
                :rows="pageSize"
                dataKey="id"
                :filters="filters"
                :first="currentPage * pageSize"
                :totalRecords="totalRecords"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Đang hiển thị {first} - {last} từ {totalRecords} quản trị viên"
                @page="onPageChange"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters.global.value" placeholder="Tìm theo tên..." />
                        </IconField>
                        <div class="space-x-2">
                            <Button label="Xóa" icon="pi pi-trash" :disabled="!selectedAccounts.length" @click="confirmDeleteSelected" />
                            <Button label="Xuất CSV" icon="pi pi-upload" @click="exportCSV($event)" />
                        </div>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem"></Column>
                <Column field="displayName" header="Họ và tên" sortable></Column>
                <Column field="email" header="Email" sortable></Column>
                <Column field="provider" header="Loại tài khoản" sortable></Column>
                <Column :exportable="false" style="min-width: 12rem" header="Hành động">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" class="mr-2" @click="editAccount(slotProps.data)" />
                        <Button icon="pi pi-trash" class="text-red-500" @click="confirmDeleteAccount(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="accountDialog" :header="account.id ? 'Phân quyền' : 'New Account'" modal>
            <div class="p-fluid space-y-4 text-xl mb-8">
                <div class="grid grid-cols-4 gap-8">
                    <div v-for="role in roles" :key="role" class="col-span-1">
                        <Checkbox v-model="account.rights" :value="role" class="mr-2" />
                        <label for="rights">{{ role }}</label>
                    </div>
                </div>
            </div>
            <template #footer>
                <Button label="Hủy" @click="accountDialog = false" class="text-xl" />
                <Button label="Lưu" @click="saveAccount" class="text-xl" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteAccountDialog" :style="{ width: '450px' }" header="Xác nhận xóa" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="account"
                    >Bạn có chắc chắn muốn xóa <b>{{ account.displayName }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="Không" icon="pi pi-times" text @click="deleteAccountDialog = false" />
                <Button label="Có" icon="pi pi-check" @click="deleteAccount(account.id)" />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { onPageChange, totalRecords, currentPage, pageSize, accounts, filters, selectedAccounts, accountDialog, deleteAccountDialog, account, roles, saveAccount, deleteAccount, loading, getPaginatedAccounts } from '@/composables/account';

const dt = ref();

getPaginatedAccounts();

const editAccount = (selectedAccount) => {
    accountDialog.value = true;
    account.value = { ...selectedAccount };
};

const confirmDeleteAccount = (selectedAccount) => {
    deleteAccountDialog.value = true;
    account.value = { ...selectedAccount };
};

const confirmDeleteSelected = () => {
    selectedAccounts.value.forEach((acc) => deleteAccount(acc.id));
};

function exportCSV() {
    dt.value.exportCSV();
}
</script>
