<template>
    <div class="flex flex-col items-center justify-center">
      <div class="bg-white p-6 rounded-lg shadow-md w-96">
        <h1 class="text-2xl font-semibold text-center text-gray-800 mb-4">Display Image</h1>
        <div v-if="isLoading" class="text-center text-sm text-blue-500">Loading image...</div>
        <div v-else-if="imageUrl" class="text-center">
          <img :src="imageUrl" alt="Uploaded" class="w-full h-auto rounded-md shadow-lg" />
        </div>
        <div v-else class="text-center text-sm text-red-500">
          No image found.
        </div>
      </div>
    </div>
  </template>

  <script>
  import { defineComponent, ref, onMounted } from 'vue';
  import { getFirestore, doc, getDoc } from 'firebase/firestore';

  export default defineComponent({
    name: 'ImageDisplay',
    setup() {
      const imageUrl = ref(null); // To store the image URL or null
      const isLoading = ref(true); // To handle loading state
      const message = ref(''); // To store message

      const db = getFirestore();

      const fetchImage = async () => {
        try {
          const docRef = doc(db, 'images', 'userId'); // Replace 'userId' with a valid ID
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const imageBinary = docSnap.data()?.imageBinary;

            if (imageBinary) {
              // Convert base64 back to an image
              imageUrl.value = imageBinary;
            } else {
              message.value = 'No image found in Firestore.';
            }
          } else {
            message.value = 'Document not found.';
          }
        } catch (error) {
          console.error('Error fetching image:', error);
          message.value = 'Failed to fetch image.';
        } finally {
          isLoading.value = false;
        }
      };

      // Fetch image on component mount
      onMounted(() => {
        fetchImage();
      });

      return {
        imageUrl,
        isLoading,
        message
      };
    }
  });
  </script>

  <style scoped>
  /* You can add custom styles here if needed, but we are using Tailwind CSS */
  </style>
