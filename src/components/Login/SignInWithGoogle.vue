<template>
    <div class="mt-4 space-y-2">
      <p class="font-semibold text-center my-2">hoặc đăng nhập nhanh bằng</p>
      <Button label="Google" icon="pi pi-google" class="mr-2 mb-2 !w-full" @click="signInWithGoogle" />
    </div>
  </template>

  <script setup>
  import { ref, defineEmits } from 'vue'
  import { useRouter } from 'vue-router'
  import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
  import { handleAuthenticationSuccess } from '@/composables/authentication/index'

  const router = useRouter()

  const errorMessage = ref('')

  const emits = defineEmits(['action:openResetPasswordModal', 'action:updateErrorMessage'])

  const signInWithGoogle = () => {
    const auth = getAuth()
    const provider = new GoogleAuthProvider()
    signInWithPopup(auth, provider)
      .then((result) => {
        handleAuthenticationSuccess(result.user, router)
      })
      .catch((error) => {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            errorMessage.value = 'Bạn đã đóng cửa sổ đăng nhập Google trước khi hoàn tất.'
            emits('action:updateErrorMessage', errorMessage.value)
            break
          case 'auth/cancelled-popup-request':
            errorMessage.value = 'Đã có lỗi xảy ra khi đăng nhập bằng Google. Vui lòng thử lại.'
            emits('action:updateErrorMessage', errorMessage.value)

            break
          case 'auth/network-request-failed':
            errorMessage.value = 'Lỗi kết nối mạng. Vui lòng kiểm tra lại kết nối.'
            emits('action:updateErrorMessage', errorMessage.value)
            break
          default:
            errorMessage.value = 'Đã xảy ra lỗi khi đăng nhập bằng Google. Vui lòng thử lại.'
            emits('action:updateErrorMessage', errorMessage.value)
        }
        console.error('Error during Google sign-in:', error)
      })
  }
  </script>
