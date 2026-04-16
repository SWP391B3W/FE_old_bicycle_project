export type ConditionType = 'new_90' | 'used' | 'needs_repair'

export type ProductStatus =
  | 'pending'
  | 'active'
  | 'hidden'
  | 'sold'
  | 'pending_inspection'
  | 'inspected_passed'
  | 'inspected_failed'

export interface ProductSeller {
  id: string
  firstName: string
  lastName: string
  avatarUrl?: string | null
  phone?: string | null
}

export interface ProductImage {
  id: string
  url: string
  isPrimary: boolean
  displayOrder: number
}

export interface ProductInspectionInfo {
  id: string
  overallScore?: number | null
  passed?: boolean | null
  reportFileUrl?: string | null
  validUntil?: string | null
  createdAt: string
}

export interface Product {
  id: string
  title: string
  description?: string | null
  price: number
  originalPrice?: number | null
  condition?: ConditionType | null
  status: ProductStatus
  province?: string | null
  district?: string | null
  frameSize?: string | null
  wheelSize?: string | null
  groupsetId?: string | null
  groupset?: string | null
  createdAt: string
  expiresAt?: string | null
  seller?: ProductSeller | null
  brandName?: string | null
  categoryId?: string | null
  categoryName?: string | null
  brakeTypeName?: string | null
  frameMaterialName?: string | null
  images: ProductImage[]
  isVerified: boolean
  lockedForTransaction: boolean
  sellerActionLocked?: boolean
  inspection?: ProductInspectionInfo | null
}

export interface ProductFilterRequest {
  keyword?: string
  brandId?: string
  categoryId?: string
  brakeTypeId?: string
  frameMaterialId?: string
  condition?: ConditionType
  frameSize?: string
  wheelSize?: string
  groupsetId?: string
  groupset?: string
  minPrice?: number
  maxPrice?: number
  province?: string
  district?: string
  ward?: string
  hasInspection?: boolean
  sortBy?: string
}

export interface ProductMutationInput {
  title?: string
  description?: string
  price?: number
  originalPrice?: number
  brakeTypeId?: string
  frameMaterialId?: string
  brandId?: string
  categoryId?: string
  frameSize?: string
  wheelSize?: string
  groupsetId?: string
  condition?: ConditionType
  province?: string
  district?: string
  images?: File[]
}
