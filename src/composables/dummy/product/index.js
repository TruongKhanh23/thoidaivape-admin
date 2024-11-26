import { db } from '@/firebaseConfig';
import images from './images.json';
import { collection, addDoc } from 'firebase/firestore';

// Các giá trị cố định
const brands = [
    { id: 'oxva', name: 'Oxva' },
    { id: 'aspire', name: 'Aspire' },
    { id: 'fitpod', name: 'Fitpod' },
    { id: 'lost-vape', name: 'Lost Vape' },
    { id: 'voopoo', name: 'Voopoo' },
    { id: 'geek-vape', name: 'Geek Vape' },
    { id: 'dovpo', name: 'Dovpo' },
    { id: 'sp2s', name: 'SP2S' },
    { id: 'romio-astro', name: 'Romio Astro' },
    { id: 'dotmod', name: 'dotMod' }
];

const statusOptions = [
    { id: 'in_stock', name: 'Còn hàng' },
    { id: 'out_of_stock', name: 'Hết hàng' }
];

const collections = [
    { id: 'podsystem', name: 'Podsystem' },
    { id: 'vape-box', name: 'Vape Box' },
    { id: 'freebase', name: 'Freebase' },
    { id: 'occ-coil', name: 'Occ Coil' },
    { id: 'pod-head', name: 'Pod Head' },
    { id: 'saltnic', name: 'Saltnic' }
];

function getRandomThumbnail() {
    if (!Array.isArray(images) || images.length === 0) {
        throw new Error('Images array is empty or not valid.');
    }
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
}

/**
 * Function to get 3 random images from the images array
 * @returns {string[]} An array of 3 random image strings
 */
function getRandomImages() {
    if (!Array.isArray(images) || images.length < 3) {
        throw new Error('Images array does not have enough elements.');
    }
    // Shuffle the array and pick the first 3 elements
    const shuffledImages = images.slice().sort(() => Math.random() - 0.5);
    return shuffledImages.slice(0, 3);
}

function generateRandomTags() {
    const tagsPool = ['Compact', 'Portable', 'Powerful', 'Sleek', 'Flavorful', 'Long Battery Life', 'High Capacity', 'Beginner Friendly', 'Advanced Features', 'Customizable', 'Affordable', 'Eco Friendly'];

    // Xáo trộn danh sách tags
    const shuffledTags = tagsPool.sort(() => Math.random() - 0.5);

    // Lấy tối đa 3 tags
    const numberOfTags = Math.floor(Math.random() * 3) + 1; // Chọn ngẫu nhiên từ 1 đến 3 tags
    const selectedTags = shuffledTags.slice(0, numberOfTags);

    // Tạo mảng các object với id và name
    return selectedTags.map((tag) => ({
        id: tag.toLowerCase().replace(/\s+/g, ''), // Biến tag thành chữ thường và bỏ khoảng trắng
        name: tag
    }));
}

function generateRandomProductName() {
    const brands = ['VapeMaster', 'CloudKing', 'PuffTech', 'ZenSmoke', 'MistVapor'];
    const features = ['Pro', 'Max', 'Lite', 'Ultra', 'Air', 'Plus'];
    const styles = ['Classic', 'Nano', 'Mini', 'XL', 'Advance', 'Turbo'];

    // Chọn ngẫu nhiên từng phần của tên
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const feature = features[Math.floor(Math.random() * features.length)];
    const style = styles[Math.floor(Math.random() * styles.length)];

    // Kết hợp các phần
    return `${brand} ${feature} ${style}`;
}

function generateRandomProductDescription() {
    const descriptions = [
        'Trải nghiệm hơi nước **mượt mà** với mẫu mới nhất của chúng tôi, phù hợp cho cả người mới bắt đầu và người dùng lâu năm.',
        "Được thiết kế với <span style='color:blue;'>phong cách</span> và <b>hiệu năng</b> vượt trội, sản phẩm mang lại hương vị đậm đà và nhất quán.",
        'Nhỏ gọn nhưng mạnh mẽ, thiết kế tinh tế dễ dàng bỏ túi và mang đến trải nghiệm tuyệt vời.',
        'Thưởng thức những buổi vaping lâu dài nhờ vào <b><i>pin cao cấp</i></b> và bình chứa dung lượng lớn.',
        'Dành riêng cho <i>người đam mê vaping</i>, thiết bị này kết hợp giữa thẩm mỹ và công nghệ tiên tiến.',
        "Tạm biệt những thiết bị cồng kềnh. Mẫu nhỏ gọn của chúng tôi mang lại sự <span style='color:green;'>tiện lợi</span> và hiệu năng tối ưu.",
        'Tận hưởng hương vị yêu thích với thiết bị tùy chỉnh cao và thân thiện cho người mới sử dụng.',
        'Nâng tầm phong cách sống của bạn với thiết bị **thân thiện môi trường**, được thiết kế cho sự bền vững và hiện đại.'
    ];

    const imageUrls = ['https://picsum.photos/300/200?random=1', 'https://picsum.photos/300/200?random=2', 'https://picsum.photos/300/200?random=3', 'https://picsum.photos/300/200?random=4', 'https://picsum.photos/300/200?random=5'];

    const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
    const randomImage = imageUrls[Math.floor(Math.random() * imageUrls.length)];

    // Tạo nội dung HTML
    return `
        <div style="margin-bottom: 20px;">
            <p>${randomDescription}</p>
            <img src="${randomImage}" alt="Hình ảnh sản phẩm" style="max-width:100%; margin-top: 10px;">
        </div>
    `;
}

function generateShortDescription() {
    const descriptions = [
        'Thuốc lá điện tử mang lại trải nghiệm mới mẻ với hương vị tinh tế và thiết kế nhỏ gọn, dễ dàng mang theo bên mình.',
        'Sản phẩm được thiết kế với công nghệ hiện đại, giúp tạo ra hơi nước mịn màng và đậm đà hương vị.',
        'Hãy tận hưởng sự tiện lợi và phong cách với thiết kế sang trọng, phù hợp cho cả người mới bắt đầu và người dùng chuyên nghiệp.',
        'Với dung lượng pin lớn và khả năng tùy chỉnh linh hoạt, thuốc lá điện tử này đảm bảo trải nghiệm vaping không gián đoạn.',
        'Khám phá sự kết hợp giữa hiệu suất vượt trội và tính thẩm mỹ, mang đến phong cách và chất lượng trong từng hơi thở.',
        'Sản phẩm thân thiện với môi trường, giúp bạn tận hưởng hương vị yêu thích mà không gây ảnh hưởng đến người xung quanh.',
        'Hãy trải nghiệm sự thoải mái và tinh tế với thiết kế nhỏ gọn, phù hợp cho mọi hoàn cảnh sử dụng.',
        'Thuốc lá điện tử này mang đến sự lựa chọn lý tưởng với hiệu năng cao, hương vị đa dạng và giá cả phải chăng.'
    ];

    // Chọn ngẫu nhiên một đoạn mô tả
    return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// Tạo sản phẩm mới
export const createDummyProducts = async () => {
    const now = new Date();
    try {
        for (let i = 0; i < 30; i++) {
            const product = {
                createdBy: 'thoidaivape.cafe@gmail.com',
                updatedBy: 'thoidaivape.cafe@gmail.com',
                createdAt: now,
                updatedAt: now,
                name: generateRandomProductName(),
                price: Math.floor(Math.random() * 200000) + 10000,
                salePrice: Math.floor(Math.random() * 200000) + 10000,
                hits: Math.floor(Math.random() * 50) + 20,
                power: Math.floor(Math.random() * 300) + 100,
                soldAmount: Math.floor(Math.random() * 200),
                shortDescription: generateShortDescription(),
                description: generateRandomProductDescription(),
                brand: brands[Math.floor(Math.random() * brands.length)],
                status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
                collection: collections[Math.floor(Math.random() * collections.length)],
                tags: generateRandomTags(),
                thumbnail: getRandomThumbnail(),
                images: getRandomImages()
            };
            await addDoc(collection(db, 'products'), product);
            console.log(`Added product: Product ${i + 1}`);
        }
    } catch (error) {
        console.log(console.error);
    }
    console.log('All products have been added.');
};
