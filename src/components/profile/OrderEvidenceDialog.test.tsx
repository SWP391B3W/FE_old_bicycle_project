import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OrderEvidenceDialog } from './OrderEvidenceDialog'

describe('OrderEvidenceDialog', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:preview-url'),
      revokeObjectURL: vi.fn(),
    })
  })

  it('blocks submit when files are required but no file is selected', async () => {
    const onSubmit = vi.fn()

    render(
      <OrderEvidenceDialog
        open
        title="Xác nhận bàn giao"
        description="Seller cần gửi ảnh bàn giao cho đơn"
        noteLabel="Ghi chú"
        notePlaceholder="Nhập ghi chú"
        submitLabel="Gửi"
        orderTitle="Trek Domane"
        requireFiles
        onClose={() => {}}
        onSubmit={onSubmit}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Gửi' }))

    expect(await screen.findByText('Vui lòng tải lên ít nhất 1 ảnh chứng cứ.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits trimmed note and selected files', async () => {
    const onSubmit = vi.fn()

    render(
      <OrderEvidenceDialog
        open
        title="Xác nhận đã nhận xe"
        description="Buyer có thể tải ảnh nhận xe"
        noteLabel="Ghi chú"
        notePlaceholder="Nhập ghi chú"
        submitLabel="Xác nhận"
        orderTitle="Cannondale CAAD"
        onClose={() => {}}
        onSubmit={onSubmit}
      />,
    )

    fireEvent.change(screen.getByLabelText('Ghi chú'), {
      target: { value: '  Xe đã nhận đủ phụ kiện  ' },
    })

    const input = screen.getByLabelText(/Ảnh chứng cứ/i)
    const file = new File(['image-content'], 'handover.png', { type: 'image/png' })

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        note: 'Xe đã nhận đủ phụ kiện',
        files: [file],
      })
    })
  })
})
