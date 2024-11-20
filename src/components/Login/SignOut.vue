<template>
  <div v-if="isLoggedIn">
    <p class="hover:underline font-semibold text-center" @click="handleSignOut">Đăng xuất</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth'
import router from '@/router'
import store from "@/store"

const isLoggedIn = ref(false)
const user = ref({
  displayName: '',
})
const auth = getAuth()

onMounted(() => {
  onAuthStateChanged(auth, (userData) => {
    isLoggedIn.value = !!userData
    if (userData) {
      user.value = {
        displayName: userData.displayName || userData.email || '',
      }
    }
  })
})

const handleSignOut = () => {
  signOut(auth).then(() => {
    store.dispatch('setIsLoggedIn', false)
    store.dispatch('setAccount', {})
    router.push('/admin/login').then(() => {
      window.scrollTo(0, 0) // Scroll to the top after navigating to home
    })
  })
}
</script>

<style scoped>
/* Style cho component nếu cần */
</style>
