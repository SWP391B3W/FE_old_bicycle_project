import {
  buildVietnamDistrictOptions,
  buildVietnamProvinceOptions,
  buildVietnamWardOptions,
  type AdministrativeOption,
  type VietnamDistrictApiRecord,
  type VietnamProvinceApiRecord,
} from '@/lib/vietnamese-provinces'

const VIETNAM_PROVINCES_API_BASE_URL = 'https://provinces.open-api.vn/api/v1'

let provinceOptionsPromise: Promise<AdministrativeOption[]> | null = null

const districtOptionsPromises = new Map<number, Promise<AdministrativeOption[]>>()
const wardOptionsPromises = new Map<number, Promise<AdministrativeOption[]>>()

async function requestJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to load administrative data: ${response.status}`)
  }

  return (await response.json()) as T
}

export const vietnamProvincesApi = {
  getAll() {
    if (!provinceOptionsPromise) {
      provinceOptionsPromise = requestJson<VietnamProvinceApiRecord[]>(`${VIETNAM_PROVINCES_API_BASE_URL}/p/`)
        .then((result) => buildVietnamProvinceOptions(Array.isArray(result) ? result : []))
        .catch((error) => {
          provinceOptionsPromise = null
          throw error
        })
    }

    return provinceOptionsPromise
  },

  getDistricts(provinceCode: number) {
    if (!districtOptionsPromises.has(provinceCode)) {
      districtOptionsPromises.set(
        provinceCode,
        requestJson<VietnamProvinceApiRecord>(`${VIETNAM_PROVINCES_API_BASE_URL}/p/${provinceCode}?depth=2`)
          .then((result) => buildVietnamDistrictOptions(result.districts ?? []))
          .catch((error) => {
            districtOptionsPromises.delete(provinceCode)
            throw error
          }),
      )
    }

    return districtOptionsPromises.get(provinceCode)!
  },

  getWards(districtCode: number) {
    if (!wardOptionsPromises.has(districtCode)) {
      wardOptionsPromises.set(
        districtCode,
        requestJson<VietnamDistrictApiRecord>(`${VIETNAM_PROVINCES_API_BASE_URL}/d/${districtCode}?depth=2`)
          .then((result) => buildVietnamWardOptions(result.wards ?? []))
          .catch((error) => {
            wardOptionsPromises.delete(districtCode)
            throw error
          }),
      )
    }

    return wardOptionsPromises.get(districtCode)!
  },
}
