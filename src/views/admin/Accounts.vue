<template>
    <div>
        <div class="card">
            <div class="font-semibold text-xl">Danh sách quản trị viên</div>
            <DataTable
                v-model:selection="selectedAccounts"
                :value="accounts"
                :paginator="true"
                :rows="10"
                :loading="loading"
                dataKey="id"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} accounts"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters.global.value" placeholder="Tìm theo tên..." />
                        </IconField>
                        <Button label="Delete" icon="pi pi-trash" :disabled="!selectedAccounts.length" @click="confirmDeleteSelected" />
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem"></Column>
                <Column field="displayName" header="Họ và tên" sortable></Column>
                <Column field="email" header="Email" sortable></Column>
                <Column field="provider" header="Loại tài khoản" sortable></Column>
                <Column :exportable="false" style="min-width: 12rem">
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

        <Dialog v-model:visible="deleteAccountDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="account"
                    >Are you sure you want to delete <b>{{ account.displayName }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteAccountDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteAccount(account.id)" />
            </template>
        </Dialog>
    </div>
</template>

<script>
import { accounts, filters, selectedAccounts, accountDialog, deleteAccountDialog, account, roles, getPaginatedAccounts, saveAccount, deleteAccount, loading } from '@/composables/account';

export default {
    name: 'Account',
    setup() {
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

        return {
            loading,
            accounts,
            filters,
            selectedAccounts,
            accountDialog,
            deleteAccountDialog,
            account,
            roles,
            editAccount,
            confirmDeleteAccount,
            confirmDeleteSelected,
            saveAccount,
            deleteAccount
        };
    }
};
</script>
