<template>
    <div className="card">
        <div class="space-y-4">
            <!-- Tiêu đề -->
            <h1 class="text-2xl font-semibold text-center">Hồ sơ của tôi</h1>

            <!-- Avatar -->
            <div class="flex justify-center">
                <Avatar :label="editableAccount.displayName?.charAt(0)?.toUpperCase()" class="mr-2" size="xlarge" shape="circle"></Avatar>
            </div>
            <SignOut />

            <!-- Thông tin tài khoản -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label for="email" class="block font-bold mb-3">Email (tên đăng nhập)</label>
                    <InputText id="email" v-model.trim="editableAccount.email" required="true" autofocus :invalid="!editableAccount.email" fluid />
                </div>

                <div>
                    <label for="displayName" class="block font-bold mb-3">Tên</label>
                    <InputText id="displayName" v-model.trim="editableAccount.displayName" required="true" autofocus fluid />
                </div>
            </div>
            <!-- Nút hành động -->
            <div class="flex justify-center space-x-4 mt-8">
                <Button @click="resetChanges" :disabled="isSaving">Hủy</Button>
                <Button @click="saveChanges" :disabled="isSaving">
                    <template v-if="isSaving">
                        <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                    </template>
                    <template v-else> Lưu </template>
                </Button>
            </div>
        </div>
    </div>
</template>

<script setup>
import store from '@/store';
import SignOut from '@/components/Login/SignOut.vue';
import { ref, reactive, watch, onMounted, computed } from 'vue';
import { getAccountById, updateAccount } from '@/composables/authentication/index.js';

// Dữ liệu người dùng
const account = computed(() => store.getters.getAccount);
const editableAccount = reactive({
    id: account.value.accountId ?? account.value.uid,
    displayName: account.value.displayName,
    email: account.value.email
});

onMounted(async () => {
    try {
        const accountData = await getAccountById(account.value.uid);
        editableAccount.displayName = accountData.displayName || '';
        editableAccount.email = accountData.email || '';
        store.dispatch('setAccount', accountData);
    } catch (error) {
        console.error('Error loading account data:', error.message);
    }
});

const isSaving = ref(false);

// Lưu thông tin thay đổi
const saveChanges = async () => {
    isSaving.value = true;
    try {
        await updateAccount(editableAccount);
    } catch (error) {
        console.error('Lỗi khi lưu dữ liệu:', error);
    } finally {
        isSaving.value = false;
    }
};

// Hủy thay đổi
const resetChanges = () => {
    editableAccount.displayName = account.value.displayName;
    editableAccount.email = account.value.email;
};

// Watch account để khởi tạo dữ liệu khi cần
watch(() => account, { immediate: true });
</script>
