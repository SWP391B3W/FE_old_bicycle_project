import { getResult, postResult } from '@/lib/http'

export interface GhnProvince {
  ProvinceID: number
  ProvinceName: string
  Code: string
}

export interface GhnDistrict {
  DistrictID: number
  ProvinceID: number
  DistrictName: string
  Code: string
}

export interface GhnWard {
  WardCode: string
  DistrictID: number
  WardName: string
}

export interface GhnFeeRequest {
  from_district_id?: number
  from_ward_code?: string
  to_district_id: number
  to_ward_code: string
  weight?: number
}

export interface GhnFeeResponse {
  total: number
  service_fee: number
}

export const shippingApi = {
  getProvinces: () => getResult<GhnProvince[]>('/api/public/shipping/provinces'),

  getDistricts: (provinceId: number) =>
    getResult<GhnDistrict[]>(`/api/public/shipping/districts?province_id=${provinceId}`),

  getWards: (districtId: number) =>
    getResult<GhnWard[]>(`/api/public/shipping/wards?district_id=${districtId}`),

  calculateFee: (request: GhnFeeRequest) =>
    postResult<GhnFeeResponse>('/api/public/shipping/calculate-fee', request),
}
