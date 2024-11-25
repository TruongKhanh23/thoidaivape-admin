<template>
    <div className="card">
        <div class="font-semibold text-xl mb-4">Sample Upload File</div>
        <div class="flex flex-row space-x-4">
            <UploadFile />
            <DisplayImageFirestore />
        </div>
    </div>
</template>

<script setup>
import DisplayImageFirestore from '@/components/Sample/DisplayImageFirestore.vue';
import UploadFile from '@/components/Sample/UploadFile.vue';
</script>
