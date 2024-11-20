<template>
    <FloatingConfigurator />
    <div
        class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div
                style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="flex flex-col items-center justify-center text-center mb-8">
                        <img src="/img/original_logo.png" alt="logo" class="w-20 h-20" />
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Đăng ký</div>
                        <span class="text-muted-color font-medium">Thời đại Vape</span>
                    </div>

                    <div>
                        <label for="email1"
                            class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                        <InputText id="email1" type="text" placeholder="Email address" class="w-full md:w-[30rem] mb-8"
                            v-model="email" />

                        <label for="password1"
                            class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                        <Password id="password1" v-model="password" placeholder="Password" :toggleMask="true"
                            class="mb-4" fluid :feedback="false"></Password>

                        <Button label="Sign In" class="w-full" as="router-link" to="/"></Button>
                        <p class="text-muted-color font-medium text-center my-2">Đã có tài khoản?</p>
                        <Button label="Đăng nhập" class="w-full" @click="updateLoginType()"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { defineEmits, ref } from 'vue';

const emit = defineEmits(['action:updateLoginType'])
const email = ref('');
const password = ref('');
const checked = ref(false);

function updateLoginType() {
    emit('action:updateLoginType', 'signIn')
}
</script>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
