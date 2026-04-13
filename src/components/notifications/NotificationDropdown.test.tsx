import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NotificationDropdown } from './NotificationDropdown'

const { getMineMock, markAllReadMock, markAsReadMock } = vi.hoisted(() => ({
  getMineMock: vi.fn(),
  markAllReadMock: vi.fn(),
  markAsReadMock: vi.fn(),
}))

vi.mock('@/api/notifications.api', () => ({
  notificationsApi: {
    getMine: (...args: unknown[]) => getMineMock(...args),
    markAllAsRead: (...args: unknown[]) => markAllReadMock(...args),
    markAsRead: (...args: unknown[]) => markAsReadMock(...args),
  },
}))

function createNotification(overrides: Partial<{
  id: string
  title: string
  content: string
  isRead: boolean
}> = {}) {
  return {
    id: overrides.id ?? 'notif-1',
    userId: 'user-1',
    title: overrides.title ?? 'Đơn hàng đã cập nhật',
    content: overrides.content ?? 'Đơn hàng của bạn đang chờ xác nhận.',
    type: 'order',
    isRead: overrides.isRead ?? false,
    metadata: null,
    createdAt: '2026-03-24T10:00:00Z',
  }
}

function createPageResult(content = [createNotification()]) {
  return {
    content,
    pageable: {
      pageNumber: 0,
      pageSize: 8,
      offset: 0,
      paged: true,
      unpaged: false,
      sort: { empty: false, sorted: true, unsorted: false },
    },
    totalPages: 1,
    totalElements: content.length,
    last: true,
    size: 8,
    number: 0,
    sort: { empty: false, sorted: true, unsorted: false },
    first: true,
    numberOfElements: content.length,
    empty: content.length === 0,
  }
}

describe('NotificationDropdown', () => {
  beforeEach(() => {
    getMineMock.mockReset()
    markAllReadMock.mockReset()
    markAsReadMock.mockReset()
  })

  it('loads and shows a scrollable notification preview when the bell is opened', async () => {
    getMineMock.mockResolvedValueOnce(createPageResult())

    render(
      <MemoryRouter>
        <NotificationDropdown unreadCount={1} />
      </MemoryRouter>,
    )

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Mở thông báo' }))

    expect(await screen.findByText('Thông báo')).toBeInTheDocument()
    expect(await screen.findByText('Đơn hàng đã cập nhật')).toBeInTheDocument()
    expect(screen.getByText('Đơn hàng của bạn đang chờ xác nhận.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xem tất cả thông báo' })).toBeInTheDocument()
    expect(screen.getByLabelText('Danh sách thông báo')).toHaveClass('max-h-96', 'overflow-y-auto')
    expect(getMineMock).toHaveBeenCalledWith(0, 8)
  })

  it('marks all preview notifications as read from the dropdown header', async () => {
    getMineMock.mockResolvedValueOnce(
      createPageResult([
        createNotification(),
        createNotification({
          id: 'notif-2',
          title: 'Tin nhắn mới',
          content: 'Bạn vừa nhận được một tin nhắn mới.',
        }),
      ]),
    )
    markAllReadMock.mockResolvedValueOnce(undefined)

    render(
      <MemoryRouter>
        <NotificationDropdown unreadCount={2} />
      </MemoryRouter>,
    )

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Mở thông báo' }))
    await screen.findByText('Tin nhắn mới')

    fireEvent.click(screen.getByRole('button', { name: 'Đọc hết' }))

    await waitFor(() => {
      expect(markAllReadMock).toHaveBeenCalledTimes(1)
    })
  })
})
