import { Award, Shield, Users, type LucideIcon } from 'lucide-react'
import type { Category } from '@/types/reference-data'

export const ALL_LOCATION_VALUE = '__all__'

const CATEGORY_ICONS: Record<string, string> = {
  bicycles: '🚲',
  'road-bikes': '🚴',
  'mountain-bikes': '🚵',
  'gravel-bikes': '🛤️',
  'city-bikes': '🏙️',
}

export interface HomeTrustFeature {
  icon: LucideIcon
  title: string
  description: string
}

export const TRUST_FEATURES: HomeTrustFeature[] = [
  {
    icon: Shield,
    title: 'Kiểm duyệt cực kỳ nghiêm ngặt',
    description:
      'Tất cả tin đăng đều được ban quản trị kiểm định chất lượng trước khi hiển thị.',
  },
  {
    icon: Award,
    title: 'Thông tin xe rõ ràng',
    description:
      'Người mua xem được thông tin xe, ảnh, trạng thái kiểm định và lịch sử giao dịch liên quan.',
  },
  {
    icon: Users,
    title: 'Luồng mua bán có kiểm soát',
    description:
      'Đơn mua, đặt cọc, hoàn tiền và giải ngân đều đi qua các bước xác nhận rõ ràng.',
  },
]

export function getCategoryIcon(category: Category) {
  return (
    CATEGORY_ICONS[category.slug] ??
    CATEGORY_ICONS[category.name.toLowerCase().replace(/\s+/g, '-')] ??
    '🚲'
  )
}