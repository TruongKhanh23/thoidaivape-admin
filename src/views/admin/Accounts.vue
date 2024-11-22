<template>
    <div>
        <div class="card">
            <div class="font-semibold text-xl">Danh sách quản trị viên</div>
            <DataTable
                ref="dtAccounts"
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


        <Dialog v-model:visible="accountDialog" header="Phân quyền" :modal="true" :closable="true" :style="{ width: '450px' }">
            <div>
                <div class="mb-4">
                    <div class="font-semibold">Quyền</div>
                    <MultiSelect v-model="account.rights" :options="roles" optionLabel="name" placeholder="Chọn quyền" :filter="true" class="w-full max-w-full" />
                </div>
                <div class="flex justify-end gap-2">
                    <Button label="Hủy" icon="pi pi-times" class="p-button-text" @click="accountDialog = false" />
                    <Button label="Lưu" icon="pi pi-check" class="p-button-primary" @click="saveAccount" />
                </div>
            </div>
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

const dtAccounts = ref();

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
    dtAccounts.value.exportCSV();
}
</script>
