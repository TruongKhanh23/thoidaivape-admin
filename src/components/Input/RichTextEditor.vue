<template>
    <div class="editor-container w-full">
        <div ref="editor" class="quill-editor"></div>
        <div class="mt-2 text-sm text-gray-500">Tổng byte: {{ totalBytes }} bytes / {{ MAX_SIZE }} - Còn lại: {{ MAX_SIZE - totalBytes }}</div>
        <div v-if="isExceedMaxSize" class="text-red-500 text-sm mt-2">Dung lượng văn bản đã đạt mức tối đa 1048487 byte, vui lòng tóm gọn lại văn bản.</div>

        <div class="mt-4">
            <label for="rows" class="mr-2">Số dòng:</label>
            <select id="rows" v-model="numRows" class="px-2 py-1 border rounded">
                <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
            </select>

            <label for="columns" class="ml-4 mr-2">Số cột:</label>
            <select id="columns" v-model="numColumns" class="px-2 py-1 border rounded">
                <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
            </select>

            <Button @click="createTable" class="ml-4 px-4 py-2 rounded">Thêm Bảng</Button>
        </div>

        <!-- Hiển thị nội dung dưới editor -->
        <div class="font-semibold text-xl my-4">Xem trước</div>
        <div class="mt-4 p-4 border rounded" v-html="formattedContent"></div>
    </div>
</template>

<script>
import { ref, onMounted, computed, nextTick } from 'vue';
import Quill from 'quill';
import 'quill/dist/quill.snow.css'; // Import Quill CSS

export default {
    name: 'RichTextEditor',
    setup(_, { emit }) {
        const editor = ref(null);
        const editorContent = ref(''); // Lưu trữ nội dung editor
        const numRows = ref(3); // Mặc định số dòng là 3
        const numColumns = ref(3); // Mặc định số cột là 3
        const isExceedMaxSize = ref(false); // Biến trạng thái kiểm tra dung lượng
        const totalBytes = ref(0); // Lưu trữ tổng số byte
        const MAX_SIZE = 1048487; // Giới hạn dung lượng tối đa là 1048487 byte

        let quillInstance = null;

        // Khởi tạo Quill editor
        onMounted(() => {
            quillInstance = new Quill(editor.value, {
                theme: 'snow',
                modules: {
                    toolbar: [[{ header: '1' }, { header: '2' }, { font: [] }], [{ list: 'ordered' }, { list: 'bullet' }], ['bold', 'italic', 'underline', 'strike'], ['link', 'image'], [{ align: [] }], ['blockquote', 'code-block'], [{ color: [] }]]
                }
            });

            // Theo dõi sự thay đổi trong nội dung của Quill
            quillInstance.on('text-change', () => {
                editorContent.value = quillInstance.root.innerHTML;
                checkContentSize(); // Kiểm tra dung lượng mỗi khi nội dung thay đổi
                updateTotalBytes(); // Cập nhật tổng số byte khi có thay đổi nội dung
                emit('richTextUpdated', editorContent.value);
            });

            // Đảm bảo CSS bảng được áp dụng sau khi tạo nội dung
            nextTick(() => {
                applyTableCSS();
            });
        });

        // Hàm kiểm tra dung lượng của nội dung
        const checkContentSize = () => {
            const contentByteSize = new TextEncoder().encode(editorContent.value).length;
            if (contentByteSize > MAX_SIZE) {
                isExceedMaxSize.value = true; // Hiển thị thông báo nếu vượt quá giới hạn
            } else {
                isExceedMaxSize.value = false; // Ẩn thông báo nếu dung lượng hợp lệ
            }
        };

        // Hàm thêm CSS vào bảng và ô trong bảng
        const applyTableCSS = () => {
            const tables = document.querySelectorAll('table');
            tables.forEach((table) => {
                table.classList.add('min-w-full', 'table-auto', 'border-collapse', 'border', 'border-black');

                const ths = table.querySelectorAll('th');
                ths.forEach((th) => th.classList.add('border', 'border-black', 'p-2', 'text-left'));

                const tds = table.querySelectorAll('td');
                tds.forEach((td) => td.classList.add('border', 'border-black', 'p-2', 'text-left'));
            });
        };

        const createTable = () => {
            const table = document.createElement('table');
            const numRowsVal = numRows.value;
            const numColumnsVal = numColumns.value;

            // Tạo các hàng và cột cho bảng
            for (let i = 0; i < numRowsVal; i++) {
                const row = table.insertRow();
                for (let j = 0; j < numColumnsVal; j++) {
                    const cell = row.insertCell();
                    cell.classList.add('border', 'border-black', 'p-2', 'text-left');
                }
            }

            // Thêm bảng vào nội dung của Quill
            const range = quillInstance.getSelection();
            if (range) {
                quillInstance.clipboard.dangerouslyPasteHTML(range.index, table.outerHTML);
            }

            // Áp dụng CSS cho bảng vừa tạo
            nextTick(() => {
                applyTableCSS();
            });
        };

        const updateTotalBytes = () => {
            totalBytes.value = new TextEncoder().encode(editorContent.value).length; // Tính tổng byte
        };

        // Format content (hiển thị lại nội dung với HTML)
        const formattedContent = computed(() => {
            return editorContent.value;
        });

        return {
            editor,
            formattedContent,
            numRows,
            numColumns,
            createTable,
            isExceedMaxSize,
            totalBytes,
            MAX_SIZE
        };
    }
};
</script>

<style scoped>
/* Customize editor container if needed */
.editor-container {
    margin: 0 auto;
}
.quill-editor {
    min-height: 300px;
}
</style>
