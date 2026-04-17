export type ReportReason = 'fraud' | 'fake' | 'wrong_description' | 'spam' | 'other'

export type ReportStatus =
  | 'pending'
  | 'investigating'
  | 'resolved_upheld'
  | 'resolved_dismissed'

export interface ReportEvidenceFile {
  id: string
  fileUrl: string
  fileName?: string | null
  contentType?: string | null
  sortOrder?: number | null
}

export interface ReportRequest {
  targetId: string
  targetType: string
  reason: ReportReason
  description?: string
  files?: File[]
}

export interface ReportProcessRequest {
  status: ReportStatus
  adminNote?: string
}

export interface Report {
  id: string
  reporterId: string
  reporterName: string
  targetId: string
  targetType: string
  reason: ReportReason
  description?: string | null
  evidenceFiles?: ReportEvidenceFile[]
  status: ReportStatus
  adminNote?: string | null
  processedById?: string | null
  processedByName?: string | null
  createdAt: string
  processedAt?: string | null
}
