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
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Đăng nhập</div>
                        <span class="text-muted-color font-medium">Thời đại Vape</span>
                    </div>

                    <div class="space-y-4">
                        <label for="email1"
                            class="block text-surface-900 dark:text-surface-0 text-xl font-medium">Email</label>
                        <InputText id="email1" type="text" placeholder="Email address" class="w-full md:w-[30rem] mb-8"
                            v-model="email" />

                        <label for="password1"
                            class="block text-surface-900 dark:text-surface-0 font-medium text-xl">Password</label>
                        <Password id="password1" v-model="password" placeholder="Password" :toggleMask="true"
                            class="" fluid :feedback="false"></Password>

                        <div class="flex items-center justify-between gap-8">
                            <div class="flex items-center">
                                <Checkbox v-model="rememberMe" id="rememberme1" binary class="mr-2"></Checkbox>
                                <label for="rememberme1">Lưu mật khẩu</label>
                            </div>
                            <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Quên mật
                                khẩu?</span>
                        </div>
                        <p v-if="errorMessage" class="text-red-500">
                            {{ errorMessage }}
                        </p>
                        <Button label="Đăng nhập" class="w-full" @click="login"></Button>
                        <SignInWithGoogle @action:updateErrorMessage="handleErrorMessage" />
                        <p class="font-semibold w-full text-center">Chưa có tài khoản?</p>
                        <Button label="Đăng ký" class="w-full" @click="updateLoginType()"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { handleAuthenticationSuccess } from '@/composables/authentication/index';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { defineEmits, ref } from 'vue';
import { useRouter } from 'vue-router';
import SignInWithGoogle from './SignInWithGoogle.vue';

const router = useRouter()

const emit = defineEmits(['action:updateLoginType'])

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const errorMessage = ref('')

function updateLoginType() {
    emit('action:updateLoginType', 'register')
}

const login = async () => {
    const auth = getAuth()

    try {
        await signInWithEmailAndPassword(auth, email.value, password.value)

        if (rememberMe.value) {
            localStorage.setItem('email', email.value)
            localStorage.setItem('password', password.value)
            localStorage.setItem('rememberMe', rememberMe.value)
        } else {
            localStorage.removeItem('email')
            localStorage.removeItem('password')
            localStorage.removeItem('rememberMe')
        }

        handleAuthenticationSuccess(auth.currentUser, router)
    } catch (error) {
        console.log('error code', error.code)
        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage.value = 'Email không hợp lệ'
                break
            case 'auth/user-not-found':
                errorMessage.value = 'Không tìm thấy tài khoản với email này'
                break
            case 'auth/wrong-password':
                errorMessage.value = 'Sai mật khẩu'
                break
            default:
                errorMessage.value = 'Email hoặc mật khẩu không chính xác'
                break
        }
    }
}
function handleErrorMessage(value) {
  errorMessage.value = value
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
