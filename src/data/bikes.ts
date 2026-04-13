import type { Product, ProductCondition } from '@/types/product'

export const categories = ['Road Bike', 'Mountain Bike', 'Gravel', 'City Bike', 'Folding Bike']

export const conditions: Record<ProductCondition, string> = {
  new: 'Mới 99%',
  used: 'Đã qua sử dụng',
  need_repair: 'Cần sửa chữa',
}

export const bikes: Product[] = [
  {
    id: '1',
    title: 'Trek Domane SL 6 Disc',
    brand: 'Trek',
    category: 'Road Bike',
    condition: 'used',
    price: 18900000,
    location: 'Hà Nội',
    year: '2022',
    wheelSize: '700c',
    frameSize: 'M',
    image:
      'https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&w=900&q=80',
    description:
      'Xe đạp đường trường Trek Domane SL 6 Disc, khung carbon, full groupset Shimano 105, bảo quản cẩn thận. Phù hợp đi phượt và đua xe.',
    highlights: ['Khung carbon', 'Thắng đĩa thủy lực', 'Đã bảo dưỡng định kỳ'],
    sellerName: 'Anh Thành',
    sellerSince: '2023',
  },
  {
    id: '2',
    title: 'Specialized Sirrus X 4.0',
    brand: 'Specialized',
    category: 'City Bike',
    condition: 'new',
    price: 14900000,
    location: 'Hồ Chí Minh',
    year: '2024',
    wheelSize: '700c',
    frameSize: 'L',
    image:
      'https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=900&q=80',
    description:
      'Xe đạp địa hình nhẹ, thích hợp đi phố và commuting. Thiết kế năng động, tay lái thẳng, lốp đa địa hình.',
    highlights: ['Khung nhôm', 'Phuộc dầu', 'Tư thế ngồi thẳng lưng'],
    sellerName: 'Chị Lan',
    sellerSince: '2024',
  },
  {
    id: '3',
    title: 'Giant Talon 3',
    brand: 'Giant',
    category: 'Mountain Bike',
    condition: 'used',
    price: 9800000,
    location: 'Đà Nẵng',
    year: '2021',
    wheelSize: '29"',
    frameSize: 'M',
    image:
      'https://images.unsplash.com/photo-1515809231992-1ae6b51b17f2?auto=format&fit=crop&w=900&q=80',
    description:
      'Xe địa hình Giant Talon 3, đã qua sử dụng, phù hợp leo đồi và đi đường đất. Lốp mới, phanh đĩa cơ, tấm chắn bùn rời.',
    highlights: ['Khung nhôm', 'Phanh đĩa cơ', 'Bánh 29 inch'],
    sellerName: 'Anh Nam',
    sellerSince: '2022',
  },
  {
    id: '4',
    title: 'Cannondale Topstone 105',
    brand: 'Cannondale',
    category: 'Gravel',
    condition: 'used',
    price: 22500000,
    location: 'Cần Thơ',
    year: '2023',
    wheelSize: '700c',
    frameSize: 'M',
    image:
      'https://images.unsplash.com/photo-1508599540940-1a42c4788e26?auto=format&fit=crop&w=900&q=80',
    description:
      'Xe gravel Cannondale Topstone 105, phù hợp tour đường dài và đi phượt. Khung carbon nhẹ, groupset Shimano 105.',
    highlights: ['Khung carbon', 'Tay lái gravel', 'Bảo dưỡng tốt'],
    sellerName: 'Chị Hương',
    sellerSince: '2023',
  },
  {
    id: '5',
    title: 'Brompton M6L',
    brand: 'Brompton',
    category: 'Folding Bike',
    condition: 'new',
    price: 32000000,
    location: 'Hải Phòng',
    year: '2024',
    wheelSize: '16"',
    frameSize: 'S',
    image:
      'https://images.unsplash.com/photo-1526738549142-91b8a8e3e31d?auto=format&fit=crop&w=900&q=80',
    description:
      'Xe gấp Brompton M6L hàng chính hãng, tiện đi lại thành phố và du lịch. Gấp gọn nhanh, nhẹ nhàng.',
    highlights: ['Gấp gọn', 'Khung thép', 'Bánh 16 inch'],
    sellerName: 'Anh Hoàng',
    sellerSince: '2024',
  },
  {
    id: '6',
    title: 'Scott Addict 30',
    brand: 'Scott',
    category: 'Road Bike',
    condition: 'need_repair',
    price: 16500000,
    location: 'Nha Trang',
    year: '2020',
    wheelSize: '700c',
    frameSize: 'M',
    image:
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=80',
    description:
      'Xe đạp đường trường Scott Addict 30, cần kiểm tra bộ truyền động trước khi sử dụng. Khung nhẹ, dáng đua chuyên nghiệp.',
    highlights: ['Khung carbon', 'Tay lái cong', 'Phù hợp leo đèo'],
    sellerName: 'Chị Phương',
    sellerSince: '2021',
  },
]
