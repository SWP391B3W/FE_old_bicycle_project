export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'cod'
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled'

export interface Order {
  id: string
  bikeId: string
  buyerId: string
  sellerId: string
  quantity: number
  price: number
  totalAmount: number
  status: OrderStatus
  paymentMethod: PaymentMethod
  deliveryAddress: string
  deliveryPhone: string
  deliveryName: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface CheckoutFormData {
  deliveryName: string
  deliveryPhone: string
  deliveryAddress: string
  notes: string
}

export interface PaymentFormData {
  paymentMethod: PaymentMethod
  cardholderName?: string
  cardNumber?: string
  expiryDate?: string
  cvv?: string
}
