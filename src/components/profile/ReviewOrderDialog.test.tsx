import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReviewOrderDialog } from './ReviewOrderDialog'

describe('ReviewOrderDialog', () => {
  it('validates empty comment before submit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <ReviewOrderDialog
        open
        orderTitle="Trek Domane AL 4 2023"
        onClose={() => undefined}
        onSubmit={onSubmit}
      />,
    )

    await user.click(screen.getByRole('button', { name: /gửi đánh giá/i }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(/vui lòng nhập nhận xét/i)).toBeInTheDocument()
  })

  it('submits the selected rating and trimmed comment', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(
      <ReviewOrderDialog
        open
        orderTitle="Trek Domane AL 4 2023"
        onClose={() => undefined}
        onSubmit={onSubmit}
      />,
    )

    await user.click(screen.getByRole('button', { name: /chọn 3 sao/i }))
    await user.type(screen.getByLabelText(/nhận xét/i), '  Người bán phản hồi nhanh và xe đúng mô tả.  ')
    await user.click(screen.getByRole('button', { name: /gửi đánh giá/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      rating: 3,
      comment: 'Người bán phản hồi nhanh và xe đúng mô tả.',
    })
  })
})
