import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('renders pending label', () => {
    render(<StatusBadge status="pending" />)
    expect(screen.getByText('Chờ duyệt')).toBeInTheDocument()
  })

  it('renders active label', () => {
    render(<StatusBadge status="active" />)
    expect(screen.getByText('Hoạt động')).toBeInTheDocument()
  })

  it('renders hidden label', () => {
    render(<StatusBadge status="hidden" />)
    expect(screen.getByText('Đã ẩn')).toBeInTheDocument()
  })

  it('renders inspected failed label', () => {
    render(<StatusBadge status="inspected_failed" />)
    expect(screen.getByText('Không đạt kiểm định')).toBeInTheDocument()
  })

  it('renders approved refund label', () => {
    render(<StatusBadge status="approved" />)
    expect(screen.getByText('Đã duyệt hoàn tiền')).toBeInTheDocument()
  })

  it('renders awaiting buyer confirmation label', () => {
    render(<StatusBadge status="awaiting_buyer_confirmation" />)
    expect(screen.getByText('Chờ người mua xác nhận')).toBeInTheDocument()
  })

  it('renders new report workflow labels', () => {
    render(
      <>
        <StatusBadge status="investigating" />
        <StatusBadge status="resolved_upheld" />
        <StatusBadge status="resolved_dismissed" />
      </>,
    )

    expect(screen.getByText('Đang điều tra')).toBeInTheDocument()
    expect(screen.getByText('Xác nhận vi phạm')).toBeInTheDocument()
    expect(screen.getByText('Bác bỏ báo cáo')).toBeInTheDocument()
  })

  it('prefers label override when provided', () => {
    render(<StatusBadge status="pending" labelOverride="Chờ xử lý" />)
    expect(screen.getByText('Chờ xử lý')).toBeInTheDocument()
    expect(screen.queryByText('Chờ duyệt')).not.toBeInTheDocument()
  })
})
