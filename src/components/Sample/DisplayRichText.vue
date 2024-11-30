<template>
    <div class="richtext-container w-full p-4">
      <div v-if="loading" class="text-center">
        <p>Đang tải nội dung...</p>
      </div>

      <div v-else-if="content" class="richtext-content space-y-4" v-html="content">
      </div>

      <div v-else class="text-center text-red-500">
        <p>Không tìm thấy nội dung!</p>
      </div>
    </div>
  </template>

<script>
import { ref, onMounted } from 'vue';
import { getFirestore, doc, getDoc } from 'firebase/firestore'; // Firebase Firestore

export default {
  name: 'DisplayRichText',
  props: {
    documentId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const content = ref(null); // Nội dung rich text sẽ được lưu tại đây
    const loading = ref(true); // Trạng thái loading

    // Hàm tải dữ liệu từ Firestore
    const fetchContent = async () => {
      const db = getFirestore();
      const docRef = doc(db, 'richtext', props.documentId); // Sử dụng documentId từ props để lấy dữ liệu

      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          content.value = docSnap.data().content; // Lưu nội dung từ Firestore vào content
        } else {
          console.log('Không tìm thấy tài liệu!');
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      } finally {
        loading.value = false; // Dừng trạng thái loading
      }
    };

    // Tải nội dung khi component được gắn vào màn hình
    onMounted(() => {
      fetchContent();
    });

    return {
      content,
      loading
    };
  }
};
</script>

<style>
.richtext-content img {
  @apply mx-auto max-w-full flex items-center justify-center;
}
</style>
