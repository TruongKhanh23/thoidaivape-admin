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

                    <div class="space-y-4">
                        <label for="email1"
                            class="block text-surface-900 dark:text-surface-0 text-xl font-medium">Email</label>
                        <InputText id="email1" type="text" placeholder="Email address" class="w-full md:w-[30rem] mb-8"
                            v-model="email" />

                        <label for="password1"
                            class="block text-surface-900 dark:text-surface-0 font-medium text-xl">Password</label>
                        <Password id="password1" v-model="password" placeholder="Password" :toggleMask="true"
                            fluid :feedback="false"></Password>
                        <p v-if="errorMessage" class="text-red-500">
                            {{ errorMessage }}
                        </p>
                        <Button label="Đăng ký" class="w-full" @click="register"></Button>
                        <SignInWithGoogle @action:updateErrorMessage="handleErrorMessage" />
                        <p class="font-semibold text-center">Đã có tài khoản?</p>
                        <Button label="Đăng nhập" class="w-full" @click="updateLoginType()"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { ref, defineEmits } from 'vue'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { handleAuthenticationSuccess } from '@/composables/authentication/index'
import SignInWithGoogle from './SignInWithGoogle.vue';

const router = useRouter()

const emit = defineEmits(['action:updateLoginType'])

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const register = () => {
  const auth = getAuth()
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then(() => {
      // Đăng nhập ngay sau khi tạo tài khoản
      signInWithEmailAndPassword(auth, email.value, password.value)

      handleAuthenticationSuccess(auth.currentUser, router)
    })
    .catch((error) => {
      // Bắt lỗi và hiển thị thông báo lỗi bằng tiếng Việt
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage.value = 'Email này đã được sử dụng. Vui lòng chọn email khác.'
          break
        case 'auth/invalid-email':
          errorMessage.value = 'Email không hợp lệ. Vui lòng kiểm tra lại.'
          break
        case 'auth/weak-password':
          errorMessage.value = 'Mật khẩu quá yếu. Mật khẩu phải có ít nhất 6 ký tự.'
          break
        case 'auth/operation-not-allowed':
          errorMessage.value = 'Đăng ký không thành công. Vui lòng thử lại sau.'
          break
        default:
          errorMessage.value = 'Đã xảy ra lỗi. Vui lòng thử lại.'
      }
      console.log(error.code)
    })
}

function updateLoginType() {
    emit('action:updateLoginType', 'signIn')
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
