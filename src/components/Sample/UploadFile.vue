<template>
    <div class="flex flex-col items-center justify-start">
        <div class="bg-white p-6 rounded-lg shadow-md min-w-[50vh]">
            <h1 class="text-2xl font-semibold text-center text-gray-800 mb-4">Upload Image</h1>
            <form @submit.prevent="uploadImage">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="image"> Select Image </label>
                    <div class="flex flex-row space-x-4 items-center">
                        <Button icon="pi pi-upload" class="mr-2" @click="triggerFileInput"></Button>
                        <div v-if="file" class="mb-4 text-center">
                            <img :src="imagePreview" alt="preview" class="w-16 h-16 object-cover rounded-md" />
                        </div>
                        <label v-if="file?.name" for="image">{{ file?.name }}</label>
                        <label v-else for="image">Chưa có tệp nào được chọn</label>
                        <input type="file" id="image" accept="image/*" @change="handleFileChange" class="hidden" />
                    </div>
                </div>
                <button type="submit" :disabled="!file || isUploading" class="w-full px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 focus:ring focus:ring-blue-300 focus:outline-none disabled:opacity-50">
                    <span v-if="isUploading">Uploading...</span>
                    <span v-else>Upload</span>
                </button>
            </form>
            <div v-if="message" class="mt-4 text-center text-sm text-green-500">
                {{ message }}
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

export default defineComponent({
    name: 'ImageUploader',
    setup() {
        const file = ref(null);
        const isUploading = ref(false);
        const message = ref('');
        const imagePreview = ref('');

        const triggerFileInput = () => {
            const fileInput = document.getElementById('image');
            if (fileInput) {
                fileInput.click();
            }
        };

        // Firebase Firestore reference
        const db = getFirestore();

        // Chuyển đổi hình ảnh thành chuỗi binary
        const convertToBinary = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result); // Chuỗi base64
                };
                reader.onerror = (error) => {
                    reject(error);
                };
                reader.readAsDataURL(file); // Chuyển đổi file thành Base64 string
            });
        };

        const handleFileChange = (event) => {
            const target = event.target;
            file.value = target.files ? target.files[0] : null;

            // Tạo preview cho file hình ảnh đã chọn
            if (file.value) {
                const reader = new FileReader();
                reader.onload = () => {
                    imagePreview.value = reader.result; // Lưu URL preview
                };
                reader.readAsDataURL(file.value); // Đọc file và tạo URL tạm thời
            }

            if (file.value && file.value.size > 10 * 1024 * 1024) {
                message.value = 'File size exceeds 10MB!';
                isUploading.value = false;
            }
        };

        const uploadImage = async () => {
            if (!file.value) return;

            isUploading.value = true;
            message.value = '';

            try {
                // Chuyển đổi file thành binary
                const binaryData = await convertToBinary(file.value);

                // Lưu binary vào Firestore (dưới dạng chuỗi)
                const docRef = doc(db, 'images', 'userId'); // Đảm bảo thay đổi 'userId' bằng ID hợp lệ
                await setDoc(docRef, { imageBinary: binaryData });

                console.log('Image binary has been saved to Firestore.');
                message.value = 'Image uploaded successfully!';
            } catch (error) {
                console.error('Upload failed', error);
                message.value = 'Upload failed. Please try again.';
            } finally {
                isUploading.value = false;
            }
        };

        return {
            file,
            isUploading,
            message,
            handleFileChange,
            uploadImage,
            triggerFileInput,
            imagePreview,
        };
    }
});
</script>

<style scoped></style>
