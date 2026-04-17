export interface InspectionEvaluationRequest {
  frameScore: number
  forkScore: number
  brakesScore: number
  drivetrainScore: number
  wheelsScore: number
  wearPercentage: number
  expertNotes?: string
  passed: boolean
}

export interface Inspection {
  id: string
  productId: string
  inspectorId?: string | null
  overallScore?: number | null
  frameScore?: number | null
  forkScore?: number | null
  brakesScore?: number | null
  drivetrainScore?: number | null
  wheelsScore?: number | null
  wearPercentage?: number | null
  expertNotes?: string | null
  passed?: boolean | null
  reportFileUrl?: string | null
  validUntil?: string | null
  createdAt: string
  updatedAt?: string | null
}

export interface InspectionRequestItem {
  inspectionId: string
  productId: string
  productTitle: string
  productPrice: number
  province?: string | null
  productImageUrl?: string | null
  sellerId: string
  sellerName: string
  sellerPhone?: string | null
  requestedAt: string
}

export interface InspectionHistoryItem {
  inspectionId: string
  productId: string
  productTitle: string
  productPrice: number
  province?: string | null
  productImageUrl?: string | null
  sellerId: string
  sellerName: string
  sellerPhone?: string | null
  inspectorId?: string | null
  inspectorName?: string | null
  overallScore?: number | null
  passed?: boolean | null
  reportFileUrl?: string | null
  requestedAt: string
  evaluatedAt?: string | null
  validUntil?: string | null
}

export interface InspectionDashboard {
  pendingRequests: number
  completedThisWeek: number
  passRate: number
  averageScore?: number | null
  recentInspections: InspectionHistoryItem[]
}

export interface InspectionListFilters {
  keyword?: string
  page?: number
  size?: number
}
