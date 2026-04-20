import { deleteResult, getResult, http, patchResult, compactParams } from '@/lib/http'
import type { PageResult } from '@/types/api'
import type { Product, ProductFilterRequest, ProductImage, ProductMutationInput } from '@/types/product'

type RawProductImage = Omit<ProductImage, 'isPrimary'> & {
  isPrimary?: boolean
  primary?: boolean
}

type RawProduct = Omit<Product, 'images' | 'isVerified'> & {
  images?: RawProductImage[] | null
  isVerified?: boolean
  verified?: boolean
}

function appendFormField(formData: FormData, key: string, value: unknown) {
  if (value === undefined || value === null || value === '') {
    return
  }

  formData.append(key, String(value))
}

function normalizeConditionForMutation(condition: ProductMutationInput['condition']) {
  if (condition === 'new') {
    return 'new_90'
  }

  if (condition === 'need_repair') {
    return 'needs_repair'
  }

  return condition
}

function buildProductFormData(input: ProductMutationInput) {
  const formData = new FormData()

  appendFormField(formData, 'title', input.title)
  appendFormField(formData, 'description', input.description)
  appendFormField(formData, 'price', input.price)
  appendFormField(formData, 'originalPrice', input.originalPrice)
  appendFormField(formData, 'brakeTypeId', input.brakeTypeId)
  appendFormField(formData, 'frameMaterialId', input.frameMaterialId)
  appendFormField(formData, 'brandId', input.brandId)
  appendFormField(formData, 'categoryId', input.categoryId)
  appendFormField(formData, 'frameSize', input.frameSize)
  appendFormField(formData, 'wheelSize', input.wheelSize)
  appendFormField(formData, 'groupsetId', input.groupsetId)
  appendFormField(formData, 'condition', normalizeConditionForMutation(input.condition))
  appendFormField(formData, 'province', input.province)
  appendFormField(formData, 'district', input.district)

  input.images?.forEach((image) => {
    formData.append('images', image)
  })

  return formData
}

function buildProductCreateFormData(input: ProductMutationInput) {
  const formData = new FormData()

  const requestPayload = compactParams({
    brakeTypeId: input.brakeTypeId,
    brandId: input.brandId,
    groupsetId: input.groupsetId,
    price: input.price,
    frameSize: input.frameSize,
    district: input.district,
    frameMaterialId: input.frameMaterialId,
    province: input.province,
    originalPrice: input.originalPrice,
    title: input.title,
    categoryId: input.categoryId,
    condition: normalizeConditionForMutation(input.condition),
    wheelSize: input.wheelSize,
    description: input.description,
  })

  formData.append(
    'request',
    new Blob([JSON.stringify(requestPayload)], {
      type: 'application/json',
    }),
  )

  input.images?.forEach((image) => {
    formData.append('images', image)
  })

  return formData
}

function normalizeProductImage(image: RawProductImage): ProductImage {
  return {
    ...image,
    isPrimary: Boolean(image.isPrimary ?? image.primary),
  }
}

export function normalizeProduct(product: RawProduct): Product {
  return {
    ...product,
    images: (product.images ?? []).map(normalizeProductImage),
    isVerified: Boolean(product.isVerified ?? product.verified),
    sellerActionLocked: Boolean(product.sellerActionLocked),
  }
}

function normalizeProductPage(page: PageResult<RawProduct>): PageResult<Product> {
  return {
    ...page,
    content: page.content.map(normalizeProduct),
  }
}

export const productsApi = {
  search(params: ProductFilterRequest & { page?: number; size?: number }) {
    return getResult<PageResult<RawProduct>>('/api/products', {
      params: compactParams(params),
    }).then(normalizeProductPage)
  },

  getById(productId: string) {
    return getResult<RawProduct>(`/api/products/${productId}`).then(normalizeProduct)
  },

  getMineById(productId: string) {
    return getResult<RawProduct>(`/api/products/my/${productId}`).then(normalizeProduct)
  },

  getMine(page = 0, size = 12) {
    return getResult<PageResult<RawProduct>>('/api/products/my', {
      params: { page, size },
    }).then(normalizeProductPage)
  },

  async create(payload: ProductMutationInput) {
    const response = await http.post('/api/products', buildProductCreateFormData(payload), {
      headers: {
        'Content-Type': undefined,
      },
    })

    return normalizeProduct(response.data.result as RawProduct)
  },

  async update(productId: string, payload: ProductMutationInput) {
    const response = await http.put(`/api/products/${productId}`, buildProductFormData(payload), {
      headers: {
        'Content-Type': undefined,
      },
    })

    return normalizeProduct(response.data.result as RawProduct)
  },

  delete(productId: string) {
    return deleteResult<string>(`/api/products/${productId}`)
  },

  hide(productId: string) {
    return patchResult<RawProduct>(`/api/products/${productId}/hide`).then(normalizeProduct)
  },

  show(productId: string) {
    return patchResult<RawProduct>(`/api/products/${productId}/show`).then(normalizeProduct)
  },
}
