import { MapPin, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ALL_LOCATION_LABEL, ALL_LOCATION_VALUE } from './home.constants'
import type { HomeLocationState, HomeSearchActions, HomeSearchState } from './useHomePageData'

interface HomeHeroSectionProps {
  searchState: HomeSearchState
  locationState: HomeLocationState
  searchActions: HomeSearchActions
  onSearch: () => void
}

function getDistrictPlaceholder(province: string, districtOptionsLoading: boolean) {
  if (!province) {
    return 'Chọn quận / huyện'
  }

  if (districtOptionsLoading) {
    return 'Đang tải quận / huyện...'
  }

  return 'Quận / huyện'
}

function getWardPlaceholder(district: string, wardOptionsLoading: boolean) {
  if (!district) {
    return 'Chọn phường / xã'
  }

  if (wardOptionsLoading) {
    return 'Đang tải phường / xã...'
  }

  return 'Phường / xã'
}

export function HomeHeroSection({
  searchState,
  locationState,
  searchActions,
  onSearch,
}: Readonly<HomeHeroSectionProps>) {
  const { keyword, province, district, ward } = searchState
  const {
    provinceOptions,
    districtOptions,
    wardOptions,
    provinceOptionsLoading,
    districtOptionsLoading,
    wardOptionsLoading,
  } = locationState

  const districtPlaceholder = getDistrictPlaceholder(province, districtOptionsLoading)
  const wardPlaceholder = getWardPlaceholder(district, wardOptionsLoading)

  return (
    <section className="relative overflow-hidden bg-sky-950 px-6 py-8 sm:px-8 lg:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.30),_transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.88),rgba(15,23,42,0.95))]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto mt-10 max-w-4xl text-center">
          
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Nền tảng mua bán xe đạp thể thao cũ có kiểm định
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
            Tìm kiếm linh hoạt, an tâm giao dịch với mọi tin đăng đã được ban quản trị kiểm định kỹ lưỡng.
          </p>

          <div className="mt-10 overflow-hidden rounded-[1.75rem] bg-white shadow-xl shadow-slate-950/10 ring-1 ring-slate-200/80 sm:p-5">
            <div className="grid gap-3 items-center sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
              <div className="relative min-w-0">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Tìm theo tên xe, thương hiệu"
                  className="h-12 w-full rounded-xl border-2 border-black bg-white px-12 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-black focus:ring-2 focus:ring-black/20"
                  value={keyword}
                  onChange={(event) => searchActions.setKeyword(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && onSearch()}
                />
              </div>

              <div className="relative min-w-0">
                <MapPin className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Select
                  value={province || ALL_LOCATION_VALUE}
                  onValueChange={(value) =>
                    searchActions.setProvince(value === ALL_LOCATION_VALUE ? '' : value || '')
                  }
                >
                  <SelectTrigger className="h-12 w-full rounded-xl border-2 border-black bg-white py-0 pl-12 pr-3 text-left text-slate-900 shadow-sm focus:border-black focus:ring-2 focus:ring-black/20 flex items-center">
                    <SelectValue
                      placeholder={
                        provinceOptionsLoading
                          ? 'Đang tải tỉnh / thành phố...'
                          : 'Tỉnh / thành phố'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 bg-white border border-slate-200 text-slate-900">
                    <SelectItem value={ALL_LOCATION_VALUE} className="text-slate-900">{ALL_LOCATION_LABEL}</SelectItem>
                    {provinceOptions.map((option) => (
                      <SelectItem key={option.code} value={option.name} className="text-slate-900">
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative min-w-0">
                <MapPin className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Select
                  value={district || ALL_LOCATION_VALUE}
                  onValueChange={(value) =>
                    searchActions.setDistrict(value === ALL_LOCATION_VALUE ? '' : value || '')
                  }
                  disabled={!province || districtOptionsLoading}
                >
                  <SelectTrigger className="h-12 w-full rounded-xl border-2 border-black bg-white py-0 pl-12 pr-3 text-left text-slate-900 shadow-sm focus:border-black focus:ring-2 focus:ring-black/20 flex items-center">
                    <SelectValue placeholder={districtPlaceholder} />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 bg-white border border-slate-200 text-slate-900">
                    <SelectItem value={ALL_LOCATION_VALUE} className="text-slate-900">{ALL_LOCATION_LABEL}</SelectItem>
                    {districtOptions.map((option) => (
                      <SelectItem key={option.code} value={option.name} className="text-slate-900">
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative min-w-0">
                <MapPin className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Select
                  value={ward || ALL_LOCATION_VALUE}
                  onValueChange={(value) =>
                    searchActions.setWard(value === ALL_LOCATION_VALUE ? '' : value || '')
                  }
                  disabled={!district || wardOptionsLoading}
                >
                  <SelectTrigger className="h-12 w-full rounded-xl border-2 border-black bg-white py-0 pl-12 pr-3 text-left text-slate-900 shadow-sm focus:border-black focus:ring-2 focus:ring-black/20 flex items-center">
                    <SelectValue placeholder={wardPlaceholder} />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 bg-white border border-slate-200 text-slate-900">
                    <SelectItem value={ALL_LOCATION_VALUE} className="text-slate-900">{ALL_LOCATION_LABEL}</SelectItem>
                    {wardOptions.map((option) => (
                      <SelectItem key={option.code} value={option.name} className="text-slate-900">
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                size="lg"
                className="h-12 rounded-xl bg-sky-500 px-6 text-white shadow-lg shadow-sky-500/25 hover:bg-sky-400"
                onClick={onSearch}
              >
                <Search className="mr-2 h-4 w-4" />
                Tìm kiếm
              </Button>
            </div>
          </div>

          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3 justify-items-center">
            <div className="rounded-2xl bg-sky-600/10 px-4 py-2 text-center text-sm text-slate-100 ring-1 ring-white/10 whitespace-nowrap w-fit mx-auto">
              Mọi tin đăng đều đã qua kiểm định
            </div>
            <div className="rounded-2xl bg-sky-600/10 px-2 py-2 text-center text-sm text-slate-100 ring-1 ring-white/10 whitespace-nowrap w-fit mx-auto">
              Đặt cọc và xác nhận giao dịch an toàn
            </div>
            <div className="rounded-2xl bg-sky-600/10 px-3 py-2 text-center text-sm text-slate-100 ring-1 ring-white/10 whitespace-nowrap w-fit mx-auto">
              Hoàn tiền và giải ngân đối soát kỹ lưỡng
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}