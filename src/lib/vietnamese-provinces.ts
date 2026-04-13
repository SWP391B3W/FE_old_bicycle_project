export interface AdministrativeOption {
  code: number
  name: string
  rawName: string
}

interface AdministrativeRecord {
  code: number
  name: string
}

export interface VietnamWardApiRecord extends AdministrativeRecord {
  codename: string
  division_type: string
  district_code: number
}

export interface VietnamDistrictApiRecord extends AdministrativeRecord {
  codename: string
  division_type: string
  province_code: number
  wards?: VietnamWardApiRecord[] | null
}

export interface VietnamProvinceApiRecord extends AdministrativeRecord {
  codename: string
  division_type: string
  phone_code: number
  districts?: VietnamDistrictApiRecord[] | null
}

const PROVINCE_PREFIX_PATTERN = /^(Thành phố|Tỉnh)\s+/i
const DISTRICT_PREFIX_PATTERN = /^(Quận|Huyện|Thành phố|Thị xã|Thị trấn)\s+/i
const WARD_PREFIX_PATTERN = /^(Phường|Xã|Thị trấn)\s+/i

function buildAdministrativeOptions(
  records: AdministrativeRecord[],
  stripPrefix: (name: string) => string,
): AdministrativeOption[] {
  const seen = new Set<string>()

  return records
    .map((record) => ({
      code: record.code,
      name: stripPrefix(record.name),
      rawName: record.name,
    }))
    .filter((record) => {
      if (!record.name) {
        return false
      }

      const normalizedName = normalizeVietnameseText(record.name)

      if (seen.has(normalizedName)) {
        return false
      }

      seen.add(normalizedName)
      return true
    })
    .sort((left, right) => left.name.localeCompare(right.name, 'vi'))
}

export function stripProvincePrefix(name: string): string {
  return name.replace(PROVINCE_PREFIX_PATTERN, '').trim()
}

export function stripDistrictPrefix(name: string): string {
  return name.replace(DISTRICT_PREFIX_PATTERN, '').trim()
}

export function stripWardPrefix(name: string): string {
  return name.replace(WARD_PREFIX_PATTERN, '').trim()
}

export function stripAdministrativePrefix(name: string): string {
  return stripProvincePrefix(name)
}

export function normalizeVietnameseText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function buildVietnamProvinceOptions(records: VietnamProvinceApiRecord[]): AdministrativeOption[] {
  return buildAdministrativeOptions(records, stripProvincePrefix)
}

export function buildVietnamDistrictOptions(records: VietnamDistrictApiRecord[]): AdministrativeOption[] {
  return buildAdministrativeOptions(records, stripDistrictPrefix)
}

export function buildVietnamWardOptions(records: VietnamWardApiRecord[]): AdministrativeOption[] {
  return buildAdministrativeOptions(records, stripWardPrefix)
}

export function findAdministrativeOptionByName(
  options: AdministrativeOption[],
  value?: string | null,
): AdministrativeOption | null {
  if (!value?.trim()) {
    return null
  }

  const normalizedValue = normalizeVietnameseText(value)

  return (
    options.find((option) => {
      return (
        normalizeVietnameseText(option.name) === normalizedValue ||
        normalizeVietnameseText(option.rawName) === normalizedValue
      )
    }) ?? null
  )
}

export function resolveVietnamProvinceInput(
  value: string,
  provinceOptions: AdministrativeOption[],
): string {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return ''
  }

  return findAdministrativeOptionByName(provinceOptions, stripProvincePrefix(trimmedValue))?.name
    ?? stripProvincePrefix(trimmedValue)
}
