<template>
    <div class="flex flex-col items-start space-y-2">
        <div class="flex items-center space-x-4">
            <Button icon="pi pi-upload" class="mr-2" @click="triggerFileInput" />
            <div v-if="file">
                <img :src="imagePreview" alt="preview" class="w-10 h-10 object-cover rounded-md" />
            </div>
            <label>{{ file?.name || 'Vui lòng chọn hình để tải lên' }}</label>
            <input type="file" id="image" accept="image/*" @change="handleFileChange" class="hidden" />
        </div>
        <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>
    </div>
</template>

<script>
import { defineComponent, ref } from 'vue';

export default defineComponent({
    emits: ['binary-selected', 'error'],
    setup(_, { emit }) {
        const file = ref(null);
        const imagePreview = ref('');
        const errorMessage = ref('');

        const MAX_SIZE = 500 * 1024; // 500KB

        const triggerFileInput = () => document.getElementById('image').click();

        const handleFileChange = async (event) => {
            file.value = event.target.files?.[0] || null;

            if (file.value) {
                // Kiểm tra MIME type
                if (!file.value.type.startsWith('image/')) {
                    errorMessage.value = 'Vui lòng chọn định dạng tệp là hình ảnh.';
                    emit('error', errorMessage.value);
                    file.value = null;
                    imagePreview.value = '';
                    return;
                }

                // Kiểm tra kích thước file
                if (file.value.size > MAX_SIZE) {
                    errorMessage.value = 'Vượt quá kích thước tệp tối đa 500KB. Vui lòng giảm kích thước ảnh.';
                    emit('error', errorMessage.value);
                    file.value = null;
                    imagePreview.value = '';
                    return;
                }

                errorMessage.value = '';
                const reader = new FileReader();
                reader.onload = () => {
                    imagePreview.value = reader.result;
                };
                reader.readAsDataURL(file.value);

                // Convert file to binary and emit
                const binaryData = await convertToBinary(file.value);
                emit('binary-selected', binaryData);
            }
        };

        const convertToBinary = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result); // Base64 binary data
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            });
        };

        return { file, imagePreview, triggerFileInput, handleFileChange, errorMessage };
    }
});
</script>
