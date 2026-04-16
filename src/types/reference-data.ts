export interface Brand {
  id: string
  name: string
  logoUrl?: string | null
  createdAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  parentId?: string | null
  parentName?: string | null
  createdAt: string
}

export interface ReferenceValue {
  id: string
  name: string
  description?: string | null
  createdAt: string
}

export interface SizeChartRow {
  id: string
  frameSize: string
  heightMinCm: number
  heightMaxCm: number
  note?: string | null
  displayOrder: number
}

export interface SizeChart {
  id: string
  categoryId: string
  categoryName: string
  name: string
  description?: string | null
  rows: SizeChartRow[]
  createdAt: string
  updatedAt: string
}

export interface BrandUpsertRequest {
  name: string
  logoUrl?: string
}

export interface CategoryUpsertRequest {
  name: string
  slug: string
  parentId?: string
}

export interface ReferenceValueUpsertRequest {
  name: string
  description?: string
}

export interface SizeChartRowUpsertRequest {
  frameSize: string
  heightMinCm: number
  heightMaxCm: number
  note?: string
}

export interface SizeChartUpsertRequest {
  categoryId: string
  name: string
  description?: string
  rows: SizeChartRowUpsertRequest[]
}
