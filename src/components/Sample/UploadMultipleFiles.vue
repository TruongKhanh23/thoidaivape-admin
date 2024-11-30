<template>
    <div class="flex flex-col items-center justify-start">
        <div class="bg-white p-6 rounded-lg shadow-md min-w-[50vh]">
            <h1 class="text-2xl font-semibold text-center text-gray-800 mb-4">Upload Images</h1>
            <form @submit.prevent="uploadImages">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="images"> Select Images </label>
                    <div class="flex flex-col items-center space-y-4">
                        <Button icon="pi pi-upload" class="mr-2" @click="triggerFileInput"></Button>
                        <div v-if="files.length" class="mb-4 text-center">
                            <div v-for="(file, index) in files" :key="index" class="flex flex-row items-center space-x-4">
                                <img :src="file.preview" alt="preview" class="w-16 h-16 object-cover rounded-md" />
                                <span>{{ file.name }}</span>
                            </div>
                        </div>
                        <label v-else for="images">Chưa có tệp nào được chọn</label>
                        <input type="file" id="images" accept="image/*" multiple @change="handleFilesChange" class="hidden" />
                    </div>
                </div>
                <button type="submit" :disabled="isUploading || !files.length" class="w-full px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 focus:ring focus:ring-blue-300 focus:outline-none disabled:opacity-50">
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
    name: 'MultipleFileUploader',
    setup() {
        const files = ref([]);
        const isUploading = ref(false);
        const message = ref('');
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

        const triggerFileInput = () => {
            const fileInput = document.getElementById('images');
            if (fileInput) {
                fileInput.click();
            }
        };

        const handleFilesChange = (event) => {
            const target = event.target;
            const selectedFiles = target.files ? Array.from(target.files) : [];

            files.value = selectedFiles.map(file => ({
                file,
                preview: URL.createObjectURL(file),
                name: file.name,
            }));

            // Validate files (optional)
            if (files.value.some(file => file.file.size > 10 * 1024 * 1024)) {
                message.value = 'File size exceeds 10MB!';
                isUploading.value = false;
            }
        };

        const uploadImages = async () => {
            if (!files.value.length) return;

            isUploading.value = true;
            message.value = '';

            try {
                // Chuyển đổi từng file thành binary và upload vào Firestore
                for (const fileData of files.value) {
                    const binaryData = await convertToBinary(fileData.file);
                    const docRef = doc(db, 'images', fileData.file.name);
                    await setDoc(docRef, { imageBinary: binaryData });
                    console.log(`Image ${fileData.file.name} has been saved to Firestore.`);
                }

                message.value = 'Images uploaded successfully!';
            } catch (error) {
                console.error('Upload failed', error);
                message.value = 'Upload failed. Please try again.';
            } finally {
                isUploading.value = false;
            }
        };

        return {
            files,
            isUploading,
            message,
            handleFilesChange,
            uploadImages,
            triggerFileInput,
        };
    },
});
</script>

<style scoped></style>
