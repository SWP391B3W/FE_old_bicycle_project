import { useEffect, useState } from 'react'
import { productsApi } from '@/api/products.api'
import { referenceDataApi } from '@/api/reference-data.api'
import { vietnamProvincesApi } from '@/api/vietnam-provinces.api'
import {
  findAdministrativeOptionByName,
  type AdministrativeOption,
} from '@/lib/vietnamese-provinces'
import type { Product } from '@/types/product'
import type { Category } from '@/types/reference-data'

export interface HomeSearchState {
  keyword: string
  province: string
  district: string
  ward: string
}

export interface HomeSearchActions {
  setKeyword: (value: string) => void
  setProvince: (value: string) => void
  setDistrict: (value: string) => void
  setWard: (value: string) => void
}

export interface HomeLocationState {
  provinceOptions: AdministrativeOption[]
  districtOptions: AdministrativeOption[]
  wardOptions: AdministrativeOption[]
  provinceOptionsLoading: boolean
  districtOptionsLoading: boolean
  wardOptionsLoading: boolean
}

export interface HomePageData {
  searchState: HomeSearchState
  searchActions: HomeSearchActions
  locationState: HomeLocationState
  featuredProducts: Product[]
  categories: Category[]
  featuredLoading: boolean
  categoriesLoading: boolean
}

const INITIAL_SEARCH_STATE: HomeSearchState = {
  keyword: '',
  province: '',
  district: '',
  ward: '',
}

export function useHomePageData(): HomePageData {
  const [searchState, setSearchState] = useState(INITIAL_SEARCH_STATE)
  const [provinceOptions, setProvinceOptions] = useState<AdministrativeOption[]>([])
  const [districtOptions, setDistrictOptions] = useState<AdministrativeOption[]>([])
  const [wardOptions, setWardOptions] = useState<AdministrativeOption[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [provinceOptionsLoading, setProvinceOptionsLoading] = useState(true)
  const [districtOptionsLoading, setDistrictOptionsLoading] = useState(false)
  const [wardOptionsLoading, setWardOptionsLoading] = useState(false)

  useEffect(() => {
    let ignore = false

    async function loadFeaturedProducts() {
      setFeaturedLoading(true)

      try {
        const result = await productsApi.search({
          page: 0,
          size: 4,
          sortBy: 'createdAt,desc',
        })

        if (!ignore) {
          setFeaturedProducts(result.content)
        }
      } catch {
        if (!ignore) {
          setFeaturedProducts([])
        }
      } finally {
        if (!ignore) {
          setFeaturedLoading(false)
        }
      }
    }

    void loadFeaturedProducts()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadCategories() {
      setCategoriesLoading(true)

      try {
        const result = await referenceDataApi.getCategories()
        const primaryCategories = result.filter((category) => !category.parentId).slice(0, 4)

        if (!ignore) {
          setCategories(primaryCategories)
        }
      } catch {
        if (!ignore) {
          setCategories([])
        }
      } finally {
        if (!ignore) {
          setCategoriesLoading(false)
        }
      }
    }

    void loadCategories()

    return () => {
      ignore = true
    }
  }, [])

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
    const selectedProvince = findAdministrativeOptionByName(provinceOptions, searchState.province)

    if (!selectedProvince) {
      setDistrictOptions([])
      setWardOptions([])
      setDistrictOptionsLoading(false)
      setWardOptionsLoading(false)
      return
    }

    const selectedProvinceCode = selectedProvince.code
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
  }, [provinceOptions, searchState.province])

  useEffect(() => {
    const selectedDistrict = findAdministrativeOptionByName(districtOptions, searchState.district)

    if (!selectedDistrict) {
      setWardOptions([])
      setWardOptionsLoading(false)
      return
    }

    const selectedDistrictCode = selectedDistrict.code
    let ignore = false

    async function loadWardOptions() {
      setWardOptionsLoading(true)

      try {
        const result = await vietnamProvincesApi.getWards(selectedDistrictCode)

        if (!ignore) {
          setWardOptions(result)
        }
      } catch {
        if (!ignore) {
          setWardOptions([])
        }
      } finally {
        if (!ignore) {
          setWardOptionsLoading(false)
        }
      }
    }

    void loadWardOptions()

    return () => {
      ignore = true
    }
  }, [districtOptions, searchState.district])

  function setKeyword(keyword: string) {
    setSearchState((current) => ({ ...current, keyword }))
  }

  function setProvince(province: string) {
    setSearchState((current) => ({
      ...current,
      province,
      district: '',
      ward: '',
    }))
    setDistrictOptions([])
    setWardOptions([])
  }

  function setDistrict(district: string) {
    setSearchState((current) => ({
      ...current,
      district,
      ward: '',
    }))
    setWardOptions([])
  }

  function setWard(ward: string) {
    setSearchState((current) => ({ ...current, ward }))
  }

  return {
    searchState,
    searchActions: {
      setKeyword,
      setProvince,
      setDistrict,
      setWard,
    },
    locationState: {
      provinceOptions,
      districtOptions,
      wardOptions,
      provinceOptionsLoading,
      districtOptionsLoading,
      wardOptionsLoading,
    },
    featuredProducts,
    categories,
    featuredLoading,
    categoriesLoading,
  }
}