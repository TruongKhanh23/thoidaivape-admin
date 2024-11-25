<template>
    <div class="flex flex-col items-start space-y-2">
        <div class="flex items-center space-x-4">
            <Button icon="pi pi-upload" class="mr-2" @click="triggerFileInput" />
            <div v-if="files.length">
                <div v-for="(file, index) in files" :key="index" class="flex items-center space-x-2">
                    <img :src="imagePreviews[index]" alt="preview" class="w-10 h-10 object-cover rounded-md" />
                    <span v-if="file">{{ file.name }}</span>
                </div>
            </div>
            <label v-else>Please select files to upload</label>
            <input type="file" id="image" :accept="accept" :multiple="multiple" @change="handleFileChange" class="hidden" />
        </div>
        <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>
    </div>
</template>

<script>
import { defineComponent, ref } from 'vue';

export default defineComponent({
    props: {
        multiple: {
            type: Boolean,
            default: false
        },
        maxSize: {
            type: Number,
            default: 500 * 1024 // Default: 500KB
        },
        accept: {
            type: String,
            default: 'image/*'
        }
    },
    emits: ['binary-selected'],
    setup(props, { emit }) {
        const files = ref([]);
        const imagePreviews = ref([]);
        const errorMessage = ref('');

        const triggerFileInput = () => document.getElementById('image').click();

        const handleFileChange = async (event) => {
            const selectedFiles = Array.from(event.target.files);
            const validFiles = [];
            const previews = [];

            for (const file of selectedFiles) {
                // Kiểm tra MIME type
                if (!file.type.startsWith('image/')) {
                    errorMessage.value = `Invalid file type for ${file.name}. Please select image files only.`;
                    continue;
                }

                // Kiểm tra kích thước file
                if (file.size > props.maxSize) {
                    errorMessage.value = `File ${file.name} exceeds the maximum size of ${props.maxSize / 1024}KB.`;
                    continue;
                }

                validFiles.push(file);
                previews.push(await getPreview(file));
            }

            if (validFiles.length) {
                files.value = validFiles;
                imagePreviews.value = previews;
                errorMessage.value = '';

                // Emit binary data
                const binaryData = await Promise.all(validFiles.map((file) => convertToBinary(file)));
                emit('binary-selected', props.multiple ? binaryData : binaryData[0]);
            } else {
                files.value = [];
                imagePreviews.value = [];
            }
        };

        const getPreview = (file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        };

        const convertToBinary = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result); // Base64 binary data
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            });
        };

        return { files, imagePreviews, triggerFileInput, handleFileChange, errorMessage };
    }
});
</script>
