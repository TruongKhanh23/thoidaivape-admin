<template>
    <div class="editor-container">
        <div ref="editor" class="quill-editor"></div>

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
    name: 'TextEditor',
    setup() {
        const editor = ref(null);
        const editorContent = ref(''); // Lưu trữ nội dung editor
        const numRows = ref(3); // Mặc định số dòng là 3
        const numColumns = ref(3); // Mặc định số cột là 3

        let quillInstance = null;

        // Khởi tạo Quill editor
        onMounted(() => {
            quillInstance = new Quill(editor.value, {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ header: '1' }, { header: '2' }, { font: [] }],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['bold', 'italic', 'underline', 'strike'],
                        ['link', 'image'],
                        [{ align: [] }],
                        ['blockquote', 'code-block'],
                        [{ color: [] }] // Thêm lựa chọn màu chữ vào toolbar
                    ]
                }
            });

            // Theo dõi sự thay đổi trong nội dung của Quill
            quillInstance.on('text-change', () => {
                editorContent.value = quillInstance.root.innerHTML;
            });

            // Đảm bảo CSS bảng được áp dụng sau khi tạo nội dung
            nextTick(() => {
                applyTableCSS();
            });
        });

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

        // Hàm log nội dung
        const logContent = () => {
            console.log(editorContent.value);
        };

        // Format content (hiển thị lại nội dung với HTML)
        const formattedContent = computed(() => {
            return editorContent.value;
        });

        return {
            editor,
            logContent,
            formattedContent,
            numRows,
            numColumns,
            createTable
        };
    }
};
</script>

<style scoped>
/* Customize editor container if needed */
.editor-container {
    max-width: 800px;
    margin: 0 auto;
}
.quill-editor {
    min-height: 300px;
}
</style>
