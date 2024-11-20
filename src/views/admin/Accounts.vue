<template>
    <div class="p-6">
        <h1 class="text-xl font-bold mb-4">Manage Accounts</h1>

        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2">
                <input type="text" v-model="searchTerm" placeholder="Search by name..."
                    class="p-2 border border-gray-300 rounded-md" />
                <button @click="searchAccounts" class="bg-blue-500 text-white px-4 py-2 rounded-md">
                    Search
                </button>
            </div>
            <button @click="openNewAccountDialog" class="bg-green-500 text-white px-4 py-2 rounded-md">
                Create New Account
            </button>
        </div>

        <table class="table-auto w-full text-left border-collapse border border-gray-300">
            <thead>
                <tr class="bg-gray-100">
                    <th class="px-4 py-2 border">Name</th>
                    <th class="px-4 py-2 border">Email</th>
                    <th class="px-4 py-2 border">Role</th>
                    <th class="px-4 py-2 border">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="account in filteredAccounts" :key="account.id" class="hover:bg-gray-50">
                    <td class="px-4 py-2 border">{{ account.name }}</td>
                    <td class="px-4 py-2 border">{{ account.email }}</td>
                    <td class="px-4 py-2 border">{{ account.role }}</td>
                    <td class="px-4 py-2 border">
                        <button @click="editAccount(account)"
                            class="bg-yellow-500 text-white px-2 py-1 rounded-md mr-2">
                            Edit
                        </button>
                        <button @click="deleteAccount(account.id)" class="bg-red-500 text-white px-2 py-1 rounded-md">
                            Delete
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Account Dialog -->
        <div v-if="showAccountDialog" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div class="bg-white p-6 rounded-md w-1/2">
                <h2 class="text-lg font-bold mb-4">{{ isEditMode ? 'Edit Account' : 'Create New Account' }}</h2>
                <div class="flex flex-col gap-4">
                    <div>
                        <label class="block font-medium">Name</label>
                        <input type="text" v-model="currentAccount.name"
                            class="p-2 border border-gray-300 rounded-md w-full" />
                    </div>
                    <div>
                        <label class="block font-medium">Email</label>
                        <input type="email" v-model="currentAccount.email"
                            class="p-2 border border-gray-300 rounded-md w-full" />
                    </div>
                    <div>
                        <h3 class="font-medium mb-2">Assign Permissions</h3>
                        <div v-for="permission in permissions" :key="permission" class="flex items-center gap-2">
                            <input type="checkbox" :id="permission" v-model="currentAccount.permissions"
                                :value="permission" />
                            <label :for="permission">{{ permission }}</label>
                        </div>
                    </div>
                </div>
                <div class="mt-6 flex justify-end gap-2">
                    <button @click="closeAccountDialog" class="bg-gray-500 text-white px-4 py-2 rounded-md">
                        Cancel
                    </button>
                    <button @click="saveAccount" class="bg-blue-500 text-white px-4 py-2 rounded-md">
                        Save
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useAccount } from '@/composables/account';

const {
    searchTerm,
    filteredAccounts,
    currentAccount,
    showAccountDialog,
    isEditMode,
    permissions,
    openNewAccountDialog,
    closeAccountDialog,
    saveAccount,
    editAccount,
    deleteAccount,
    searchAccounts
} = useAccount();
</script>
