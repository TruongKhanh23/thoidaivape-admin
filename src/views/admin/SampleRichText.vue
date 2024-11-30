<script setup lang="ts">
import DisplayRichText from '@/components/Sample/DisplayRichText.vue';
import HyperTextEditor from '@/components/Sample/HyperTextEditor.vue';
</script>

<template>
    <div className="card">
        <div class="font-semibold text-xl mb-4">Rich Text</div>
        <HyperTextEditor />
        <DisplayRichText documentId="yourDocumentId" />
    </div>
</template>
