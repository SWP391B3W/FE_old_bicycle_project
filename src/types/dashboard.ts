export interface DashboardStats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  totalGmv?: number
  pendingPlatformFee?: number
  recognizedPlatformRevenue?: number
  reversedPlatformFee?: number
  totalInspections: number
  passedInspections: number
  failedInspections: number
  monthlyRevenue: Record<string, number>
  monthlyGmv?: Record<string, number>
  monthlyRecognizedPlatformRevenue?: Record<string, number>
  monthlyOrders: Record<string, number>
}
