import { useEffect, useMemo, useState } from 'react'
import { vietnamProvincesApi } from '@/api/vietnam-provinces.api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { findAdministrativeOptionByName, type AdministrativeOption } from '@/lib/vietnamese-provinces'
import { cn } from '@/lib/utils'

const EMPTY_LOCATION_VALUE = '__empty_location__'

interface AdministrativeLocationFieldsProps {
  province: string
  district: string
  onProvinceChange: (value: string) => void
  onDistrictChange: (value: string) => void
  provinceRequired?: boolean
  provinceError?: string
}

export function AdministrativeLocationFields({
  province,
  district,
  onProvinceChange,
  onDistrictChange,
  provinceRequired = false,
  provinceError,
}: Readonly<AdministrativeLocationFieldsProps>) {
  const [provinceOptions, setProvinceOptions] = useState<AdministrativeOption[]>([])
  const [districtOptions, setDistrictOptions] = useState<AdministrativeOption[]>([])
  const [provinceOptionsLoading, setProvinceOptionsLoading] = useState(true)
  const [districtOptionsLoading, setDistrictOptionsLoading] = useState(false)

  const normalizedProvince = province === EMPTY_LOCATION_VALUE ? '' : province
  const normalizedDistrict = district === EMPTY_LOCATION_VALUE ? '' : district

  const selectedProvinceOption = useMemo(
    () => findAdministrativeOptionByName(provinceOptions, normalizedProvince),
    [normalizedProvince, provinceOptions],
  )
  const selectedDistrictOption = useMemo(
    () => findAdministrativeOptionByName(districtOptions, normalizedDistrict),
    [normalizedDistrict, districtOptions],
  )

  useEffect(() => {
    let ignore = false

    async function loadProvinceOptions() {
      setProvinceOptionsLoading(true)

      try {
        const result = await vietnamProvincesApi.getAll()

        if (!ignore) {
          setProvinceOptions(result)
        }
      } catch {
        if (!ignore) {
          setProvinceOptions([])
        }
      } finally {
        if (!ignore) {
          setProvinceOptionsLoading(false)
        }
      }
    }

    void loadProvinceOptions()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    if (!selectedProvinceOption) {
      setDistrictOptions([])
      setDistrictOptionsLoading(false)
      return
    }

    const selectedProvinceCode = selectedProvinceOption.code
    let ignore = false

    async function loadDistrictOptions() {
      setDistrictOptionsLoading(true)

      try {
        const result = await vietnamProvincesApi.getDistricts(selectedProvinceCode)

        if (!ignore) {
          setDistrictOptions(result)
        }
      } catch {
        if (!ignore) {
          setDistrictOptions([])
        }
      } finally {
        if (!ignore) {
          setDistrictOptionsLoading(false)
        }
      }
    }

    void loadDistrictOptions()

    return () => {
      ignore = true
    }
  }, [selectedProvinceOption])

  const provinceSelectValue = (selectedProvinceOption?.name ?? normalizedProvince) || ''
  const districtSelectValue = (selectedDistrictOption?.name ?? normalizedDistrict) || ''
  const hasProvince = normalizedProvince.length > 0
  let districtPlaceholder = 'Quận / huyện'
  if (hasProvince) {
    districtPlaceholder = districtOptionsLoading ? 'Đang tải quận / huyện...' : 'Quận / huyện'
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <label htmlFor="sellbike-province" className="text-sm font-medium">
          Tỉnh / thành phố {provinceRequired && <span className="text-red-500">*</span>}
        </label>
        <Select
          value={provinceSelectValue}
          onValueChange={(value) => {
            const val = value as string
            const nextProvince = val === EMPTY_LOCATION_VALUE ? '' : val
            onProvinceChange(nextProvince)
            onDistrictChange('')
          }}
          disabled={provinceOptionsLoading}
        >
          <SelectTrigger id="sellbike-province" className={cn('h-10 text-left', provinceError && 'border-destructive')}>
            <SelectValue
              placeholder={provinceOptionsLoading ? 'Đang tải tỉnh / thành phố...' : 'Tỉnh / thành phố'}
            />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value={EMPTY_LOCATION_VALUE}>Tỉnh / thành phố</SelectItem>
            {normalizedProvince && !selectedProvinceOption ? (
              <SelectItem value={normalizedProvince}>{normalizedProvince}</SelectItem>
            ) : null}
            {provinceOptions.map((option) => (
              <SelectItem key={option.code} value={option.name}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {provinceError ? <p className="text-sm text-destructive">{provinceError}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="sellbike-district" className="text-sm font-medium">Quận / huyện</label>
        <Select
          value={districtSelectValue}
          onValueChange={(value) => {
            const val = value as string
            onDistrictChange(val === EMPTY_LOCATION_VALUE ? '' : val)
          }}
          disabled={!hasProvince || districtOptionsLoading}
        >
          <SelectTrigger id="sellbike-district" className="h-10 text-left">
            <SelectValue placeholder={districtPlaceholder} />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value={EMPTY_LOCATION_VALUE}>Quận / huyện</SelectItem>
            {normalizedDistrict && !selectedDistrictOption ? (
              <SelectItem value={normalizedDistrict}>{normalizedDistrict}</SelectItem>
            ) : null}
            {districtOptions.map((option) => (
              <SelectItem key={option.code} value={option.name}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
