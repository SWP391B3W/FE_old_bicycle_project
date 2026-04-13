export interface ApiResponse<T> {
  code: number
  message?: string
  result: T
}

export interface PageSort {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}

export interface PageInfo {
  pageNumber: number
  pageSize: number
  offset: number
  paged: boolean
  unpaged: boolean
  sort: PageSort
}

export interface PageResult<T> {
  content: T[]
  pageable: PageInfo
  totalPages: number
  totalElements: number
  last: boolean
  size: number
  number: number
  sort: PageSort
  first: boolean
  numberOfElements: number
  empty: boolean
}

export interface ApiErrorResponse {
  code?: number
  message?: string
  result?: unknown
  timestamp?: string
}
