<template>
    <div class="w-full">
        <div class="relative">
            <InputText id="tag-input" v-model="tagInput" @keydown.enter.prevent="addTag" fluid placeholder="Hashtag của sản phẩm" />
        </div>
        <div class="mt-4">
            <div class="flex flex-wrap mt-2 gap-2">
                <span v-for="(tag, index) in tags" :key="index" class="py-1 px-2 bg-primary text-primary-contrast rounded-border">
                    {{ tag }}
                    <button class="ml-2 text-white hover:text-gray-300 focus:outline-none" @click="removeTag(index)">&times;</button>
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, defineProps, watch, onMounted, defineEmits } from 'vue';

const props = defineProps({
    initialContent: {
        type: Array,
        default: () => []
    }
});

const tagInput = ref('');
const tags = ref([]);

const emit = defineEmits(['action:tagsUpdated']);

onMounted(() => {
    if (props.initialContent) {
        tags.value = props.initialContent;
    }
});

watch(
    () => props.initialContent,
    (newContent) => {
        if (newContent !== tags.value) {
            tags.value = newContent;
        }
    }
);

function addTag() {
    if (tagInput.value.trim() !== '' && !tags.value.includes(tagInput.value)) {
        tags.value.push(tagInput.value.trim());
    }
    tagInput.value = '';
    emit('action:tagsUpdated', tags.value);
}
function removeTag(index) {
    tags.value.splice(index, 1);
    emit('action:tagsUpdated', tags.value);
}
</script>

<style scoped></style>
