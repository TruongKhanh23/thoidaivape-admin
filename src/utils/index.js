export function formatDate(date) {
    // Lấy ngày, tháng, năm, giờ, phút, giây
    const day = String(date.getDate()).padStart(2, '0'); // Đảm bảo ngày có 2 chữ số
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0, nên cộng thêm 1
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Trả về chuỗi định dạng dd/mm/yyyy hh:mm:ss
    return `${day}/${month}/${year} 
    ${hours}:${minutes}:${seconds}`;
}
