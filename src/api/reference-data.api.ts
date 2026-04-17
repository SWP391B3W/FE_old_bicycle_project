import { deleteResult, getResult, postResult, putResult } from '@/lib/http'
import type {
  Brand,
  BrandUpsertRequest,
  Category,
  CategoryUpsertRequest,
  ReferenceValue,
  ReferenceValueUpsertRequest,
  SizeChart,
  SizeChartUpsertRequest,
} from '@/types/reference-data'

export const referenceDataApi = {
  getBrands() {
    return getResult<Brand[]>('/api/brands')
  },

  createBrand(request: BrandUpsertRequest) {
    return postResult<Brand, BrandUpsertRequest>('/api/admin/brands', request)
  },

  updateBrand(brandId: string, request: BrandUpsertRequest) {
    return putResult<Brand, BrandUpsertRequest>(`/api/admin/brands/${brandId}`, request)
  },

  deleteBrand(brandId: string) {
    return deleteResult<string>(`/api/admin/brands/${brandId}`)
  },

  getCategories() {
    return getResult<Category[]>('/api/categories')
  },

  createCategory(request: CategoryUpsertRequest) {
    return postResult<Category, CategoryUpsertRequest>('/api/admin/categories', request)
  },

  updateCategory(categoryId: string, request: CategoryUpsertRequest) {
    return putResult<Category, CategoryUpsertRequest>(`/api/admin/categories/${categoryId}`, request)
  },

  deleteCategory(categoryId: string) {
    return deleteResult<string>(`/api/admin/categories/${categoryId}`)
  },

  getBrakeTypes() {
    return getResult<ReferenceValue[]>('/api/brake-types')
  },

  createBrakeType(request: ReferenceValueUpsertRequest) {
    return postResult<ReferenceValue, ReferenceValueUpsertRequest>('/api/admin/brake-types', request)
  },

  updateBrakeType(brakeTypeId: string, request: ReferenceValueUpsertRequest) {
    return putResult<ReferenceValue, ReferenceValueUpsertRequest>(
      `/api/admin/brake-types/${brakeTypeId}`,
      request,
    )
  },

  deleteBrakeType(brakeTypeId: string) {
    return deleteResult<string>(`/api/admin/brake-types/${brakeTypeId}`)
  },

  getFrameMaterials() {
    return getResult<ReferenceValue[]>('/api/frame-materials')
  },

  getGroupsets() {
    return getResult<ReferenceValue[]>('/api/groupsets')
  },

  createFrameMaterial(request: ReferenceValueUpsertRequest) {
    return postResult<ReferenceValue, ReferenceValueUpsertRequest>('/api/admin/frame-materials', request)
  },

  updateFrameMaterial(frameMaterialId: string, request: ReferenceValueUpsertRequest) {
    return putResult<ReferenceValue, ReferenceValueUpsertRequest>(
      `/api/admin/frame-materials/${frameMaterialId}`,
      request,
    )
  },

  deleteFrameMaterial(frameMaterialId: string) {
    return deleteResult<string>(`/api/admin/frame-materials/${frameMaterialId}`)
  },

  createGroupset(request: ReferenceValueUpsertRequest) {
    return postResult<ReferenceValue, ReferenceValueUpsertRequest>('/api/admin/groupsets', request)
  },

  updateGroupset(groupsetId: string, request: ReferenceValueUpsertRequest) {
    return putResult<ReferenceValue, ReferenceValueUpsertRequest>(
      `/api/admin/groupsets/${groupsetId}`,
      request,
    )
  },

  deleteGroupset(groupsetId: string) {
    return deleteResult<string>(`/api/admin/groupsets/${groupsetId}`)
  },

  getSizeChartByCategory(categoryId: string) {
    return getResult<SizeChart | null>(`/api/size-charts/category/${categoryId}`)
  },

  getAdminSizeCharts() {
    return getResult<SizeChart[]>('/api/admin/size-charts')
  },

  createSizeChart(request: SizeChartUpsertRequest) {
    return postResult<SizeChart, SizeChartUpsertRequest>('/api/admin/size-charts', request)
  },

  updateSizeChart(sizeChartId: string, request: SizeChartUpsertRequest) {
    return putResult<SizeChart, SizeChartUpsertRequest>(`/api/admin/size-charts/${sizeChartId}`, request)
  },

  deleteSizeChart(sizeChartId: string) {
    return deleteResult<string>(`/api/admin/size-charts/${sizeChartId}`)
  },
}
