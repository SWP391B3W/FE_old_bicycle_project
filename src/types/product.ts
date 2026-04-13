export type ProductCondition = 'new' | 'used' | 'need_repair'

export interface Product {
  id: string
  title: string
  brand: string
  category: string
  condition: ProductCondition
  price: number
  location: string
  year: string
  wheelSize: string
  frameSize: string
  image: string
  description: string
  highlights: string[]
  sellerName: string
  sellerSince: string
}
