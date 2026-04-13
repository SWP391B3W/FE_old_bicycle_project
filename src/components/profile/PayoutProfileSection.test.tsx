import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PayoutProfileSection } from './PayoutProfileSection'

const { getMyProfileMock, upsertMyProfileMock } = vi.hoisted(() => ({
  getMyProfileMock: vi.fn(),
  upsertMyProfileMock: vi.fn(),
}))

vi.mock('@/api/payouts.api', () => ({
  payoutsApi: {
    getMyProfile: getMyProfileMock,
    upsertMyProfile: upsertMyProfileMock,
  },
}))

describe('PayoutProfileSection', () => {
  beforeEach(() => {
    getMyProfileMock.mockReset()
    upsertMyProfileMock.mockReset()
  })

  it('loads the existing payout profile and renders current values', async () => {
    getMyProfileMock.mockResolvedValue({
      id: 'profile-1',
      userId: 'user-1',
      bankCode: 'TPBank',
      bankBin: '970423',
      accountNumber: '00000645722',
      accountName: 'NGUYEN HOANG VIET DO',
      updatedAt: '2026-03-19T08:00:00Z',
    })

    render(<PayoutProfileSection />)

    expect(await screen.findByLabelText('Ngân hàng')).toHaveValue('970423')
    expect(screen.getByDisplayValue('00000645722')).toBeInTheDocument()
    expect(screen.getByDisplayValue('NGUYEN HOANG VIET DO')).toBeInTheDocument()
  })

  it('submits the payout profile with bank name and bank bin auto-filled from the selected bank', async () => {
    const user = userEvent.setup()

    getMyProfileMock.mockResolvedValue(null)
    upsertMyProfileMock.mockResolvedValue({
      id: 'profile-1',
      userId: 'user-1',
      bankCode: 'TPBank',
      bankBin: '970423',
      accountNumber: '00000645722',
      accountName: 'NGUYEN HOANG VIET DO',
      updatedAt: '2026-03-19T08:00:00Z',
    })

    render(<PayoutProfileSection />)

    const bankSelect = await screen.findByLabelText('Ngân hàng')
    await user.selectOptions(bankSelect, '970423')
    await user.type(screen.getByPlaceholderText('Ví dụ: 00000645722'), '00000645722')
    await user.type(screen.getByPlaceholderText('Ví dụ: NGUYEN HOANG VIET DO'), 'NGUYEN HOANG VIET DO')
    await user.click(screen.getByRole('button', { name: 'Lưu payout profile' }))

    await waitFor(() => {
      expect(upsertMyProfileMock).toHaveBeenCalledWith({
        bankCode: 'TPBank',
        bankBin: '970423',
        accountNumber: '00000645722',
        accountName: 'NGUYEN HOANG VIET DO',
      })
    })

    expect(await screen.findByText('Đã lưu payout profile thành công.')).toBeInTheDocument()
  })
})
