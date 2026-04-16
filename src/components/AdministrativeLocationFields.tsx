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
}: AdministrativeLocationFieldsProps) {
  const [provinceOptions, setProvinceOptions] = useState<AdministrativeOption[]>([])
  const [districtOptions, setDistrictOptions] = useState<AdministrativeOption[]>([])
  const [provinceOptionsLoading, setProvinceOptionsLoading] = useState(true)
  const [districtOptionsLoading, setDistrictOptionsLoading] = useState(false)

  const selectedProvinceOption = useMemo(
    () => findAdministrativeOptionByName(provinceOptions, province),
    [province, provinceOptions],
  )
  const selectedDistrictOption = useMemo(
    () => findAdministrativeOptionByName(districtOptions, district),
    [district, districtOptions],
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

  const provinceSelectValue = (selectedProvinceOption?.name ?? province) || EMPTY_LOCATION_VALUE
  const districtSelectValue = (selectedDistrictOption?.name ?? district) || EMPTY_LOCATION_VALUE

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Tỉnh / thành phố {provinceRequired && <span className="text-red-500">*</span>}
        </label>
        <Select
          value={provinceSelectValue}
          onValueChange={(value) => {
            const nextProvince = value === EMPTY_LOCATION_VALUE ? '' : value
            onProvinceChange(nextProvince)
            onDistrictChange('')
          }}
          disabled={provinceOptionsLoading}
        >
          <SelectTrigger className={cn('h-10 text-left', provinceError && 'border-destructive')}>
            <SelectValue
              placeholder={provinceOptionsLoading ? 'Đang tải tỉnh / thành phố...' : 'Chọn tỉnh / thành phố'}
            />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value={EMPTY_LOCATION_VALUE}>Chọn tỉnh / thành phố</SelectItem>
            {province && !selectedProvinceOption ? (
              <SelectItem value={province}>{province}</SelectItem>
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
        <label className="text-sm font-medium">Quận / huyện</label>
        <Select
          value={districtSelectValue}
          onValueChange={(value) => {
            onDistrictChange(value === EMPTY_LOCATION_VALUE ? '' : value)
          }}
          disabled={!province || districtOptionsLoading}
        >
          <SelectTrigger className="h-10 text-left">
            <SelectValue
              placeholder={
                !province
                  ? 'Chọn tỉnh / thành trước'
                  : districtOptionsLoading
                    ? 'Đang tải quận / huyện...'
                    : 'Chọn quận / huyện'
              }
            />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value={EMPTY_LOCATION_VALUE}>Không chọn quận / huyện</SelectItem>
            {district && !selectedDistrictOption ? (
              <SelectItem value={district}>{district}</SelectItem>
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
