<template>
    <div class="flex flex-col items-start space-y-2">
        <div class="flex items-center space-x-4">
            <Button icon="pi pi-upload" @click="triggerFileInput" />
            <div v-if="files.length">
                <div v-if="files.length == 1">
                    <div v-if="imagePreviews[0]" class="flex flex-row items-center space-x-4">
                        <img :src="imagePreviews[0]" alt="preview" class="w-10 h-10 object-cover rounded-md" />
                        <span>{{ files[0].name }}</span>
                    </div>
                    <div v-else class="flex flex-row items-center space-x-4">
                        <span>Vui lòng chọn ảnh</span>
                    </div>
                </div>
                <div v-else class="flex flex-row space-x-4">
                    <div v-for="(file, index) in files" :key="index">
                        <img :src="imagePreviews[index]" alt="preview" class="w-10 h-10 object-cover rounded-md" />
                    </div>
                </div>
            </div>
            <label v-if="!files.length" for="file">Vui lòng chọn ảnh</label>

            <input type="file" :id="inputId" :accept="accept" :multiple="multiple" @change="handleFileChange" class="hidden" />
        </div>
        <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>
    </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
    props: {
        idPrefix: {
            type: String,
            required: true // Đảm bảo id duy nhất
        },
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
        },
        initialBinaries: {
            type: Array,
            default: null // Giá trị khởi tạo là mảng binary
        }
    },
    emits: ['binary-selected', 'error'],
    setup(props, { emit }) {
        const files = ref([]); // Lưu trữ các file
        const imagePreviews = ref([]); // Lưu trữ URL preview
        const errorMessage = ref('');

        // Tạo id động từ idPrefix
        const inputId = `${props.idPrefix}-file-input`;

        const triggerFileInput = () => document.getElementById(inputId).click();

        const handleFileChange = async (event) => {
            const selectedFiles = Array.from(event.target.files);
            const validFiles = [];
            const previews = [];

            for (const file of selectedFiles) {
                if (!file.type.startsWith('image/')) {
                    errorMessage.value = `Invalid file type for ${file.name}. Please select image files only.`;
                    continue;
                }

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

        const initializeFromBinaries = async () => {
            const previews = [];
            const virtualFiles = [];

            if (props.initialBinaries[0]) {
                for (const binary of props.initialBinaries) {
                    const preview = binary;
                    previews.push(preview);

                    const dummyFile = new File([''], '', { type: 'image/png' });
                    virtualFiles.push(dummyFile);
                }
            }

            files.value = virtualFiles;
            imagePreviews.value = previews;
        };

        // Watch initialBinaries prop for changes
        watch(
            () => props.initialBinaries,
            async (newBinaries) => {
                if (newBinaries && newBinaries.length > 0) {
                    await initializeFromBinaries();
                }
            },
            { immediate: true }
        );

        return {
            files,
            imagePreviews,
            triggerFileInput,
            handleFileChange,
            errorMessage,
            inputId
        };
    }
});
</script>
