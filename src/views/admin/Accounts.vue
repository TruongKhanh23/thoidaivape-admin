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
                dataKey="uid"
                :filters="filters"
                :first="currentPage * pageSize"
                :totalRecords="Number(totalRecords) || 0"
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
                            <InputText v-model="filters.global.value" placeholder="Tìm theo tên..." @input="onSearch" />
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
                <Button label="Có" icon="pi pi-check" @click="deleteAccount(account.uid)" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteSelectedAccountsDialog" :style="{ width: '450px' }" header="Xác nhận xóa" :modal="true">
            <div>
                <div class="flex items-center gap-4 mb-4">
                    <i class="pi pi-exclamation-triangle !text-3xl" />
                    <span>Bạn có chắc chắn muốn xóa các tài khoản sau?</span>
                </div>
                <ul>
                    <li v-for="account in selectedAccounts" :key="account.uid">{{ account.displayName }} ({{ account.email }})</li>
                </ul>
            </div>
            <template #footer>
                <Button label="Không" icon="pi pi-times" text @click="deleteSelectedAccountsDialog = false" />
                <Button label="Có" icon="pi pi-check" @click="deleteSelectedAccounts" />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import {
    searchCache,
    lastVisible,
    onSearch,
    onPageChange,
    totalRecords,
    currentPage,
    pageSize,
    accounts,
    filters,
    selectedAccounts,
    accountDialog,
    deleteAccountDialog,
    account,
    roles,
    saveAccount,
    deleteAccount,
    loading,
    getAllAccounts
} from '@/composables/account';
import { onMounted, onBeforeUnmount } from 'vue';

onMounted(async () => {
    accounts.value = [];
    lastVisible.value = null;
    totalRecords.value = 0;
    await getAllAccounts();
});

onBeforeUnmount(() => {
    searchCache.value = {};
});

const dtAccounts = ref();
const deleteSelectedAccountsDialog = ref(false);

getAllAccounts();

const editAccount = (selectedAccount) => {
    accountDialog.value = true;
    account.value = { ...selectedAccount };
};

const confirmDeleteAccount = (selectedAccount) => {
    deleteAccountDialog.value = true;
    account.value = { ...selectedAccount };
};

const confirmDeleteSelected = () => {
    deleteSelectedAccountsDialog.value = true;
};

const deleteSelectedAccounts = async () => {
    try {
        loading.value = true;

        for (const account of selectedAccounts.value) {
            await deleteAccount(account.uid);
            let index = accounts.value.findIndex((item) => item.uid === account.uid);
            if (index !== -1) {
                accounts.value.splice(index, 1);
            }
        }
        selectedAccounts.value = [];
        deleteSelectedAccountsDialog.value = false;
    } catch (error) {
        console.error('Error deleting selected accounts:', error);
    } finally {
        loading.value = false;
    }
};

function exportCSV() {
    dtAccounts.value.exportCSV();
}
</script>
