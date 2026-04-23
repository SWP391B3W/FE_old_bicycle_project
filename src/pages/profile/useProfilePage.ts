import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/contexts/AuthContext'
import { PASSWORD_POLICY_GUIDANCE, getPasswordPolicyChecks } from '@/lib/password-policy'
import { authService } from '@/services/authService'
import { reviewApi, type Review } from '@/api/review.api'
import { getVisibleProfileTabs, isProfileTabId } from './profile.constants'
import {
  INITIAL_PASSWORD_FORM_DATA,
  createProfileFormData,
  type PasswordFormData,
  type ProfileFormData,
  type ProfileTabId,
} from './profile.types'

function mapProfileUpdateError(error: unknown) {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message

  if (!message) {
    return 'Cập nhật thất bại. Vui lòng thử lại.'
  }

  const normalizedMessage = message.toLowerCase()

  if (normalizedMessage.includes('phone') && normalizedMessage.includes('exist')) {
    return 'Số điện thoại này đã được sử dụng.'
  }

  return message
}

function mapPasswordError(error: unknown) {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message

  if (!message) {
    return 'Đổi mật khẩu thất bại. Vui lòng thử lại.'
  }

  const normalizedMessage = message.toLowerCase()

  if (
    normalizedMessage.includes('incorrect') ||
    normalizedMessage.includes('wrong') ||
    normalizedMessage.includes('invalid') ||
    normalizedMessage.includes('credential')
  ) {
    return 'Mật khẩu hiện tại không chính xác.'
  }

  return message
}

export function useProfilePage() {
  const { user, logout, setUser } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const visibleTabs = useMemo(() => getVisibleProfileTabs(user?.role), [user?.role])
  const visibleTabIds = useMemo(() => new Set(visibleTabs.map((tab) => tab.id)), [visibleTabs])

  const [activeTab, setActiveTab] = useState<ProfileTabId>(() => {
    if (isProfileTabId(requestedTab) && visibleTabIds.has(requestedTab)) {
      return requestedTab
    }

    return 'profile'
  })
  const [isEditing, setIsEditing] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState(false)

  const [formData, setFormData] = useState(() => createProfileFormData(user))
  const [passwordData, setPasswordData] = useState<PasswordFormData>(INITIAL_PASSWORD_FORM_DATA)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const [reviews, setReviews] = useState<Review[]>([])
  const [isReviewsLoading, setIsReviewsLoading] = useState(false)

  useEffect(() => {
    if (activeTab === 'reviews' && user?.id) {
      void (async () => {
        setIsReviewsLoading(true)
        try {
          const result =
            user.role === 'buyer'
              ? await reviewApi.getBuyerReviews(user.id)
              : await reviewApi.getSellerReviews(user.id)
          setReviews(result.content || [])
        } catch (err) {
          console.error('Failed to load user reviews:', err)
        } finally {
          setIsReviewsLoading(false)
        }
      })()
    }
  }, [activeTab, user?.id])

  useEffect(() => {
    if (!user) {
      return
    }

    setFormData(createProfileFormData(user))
  }, [user])

  useEffect(() => {
    if (isProfileTabId(requestedTab) && visibleTabIds.has(requestedTab)) {
      setActiveTab(requestedTab)
      return
    }

    if (!visibleTabIds.has(activeTab)) {
      setActiveTab('profile')
    }
  }, [activeTab, requestedTab, visibleTabIds])

  function handleTabChange(nextTab: ProfileTabId) {
    setActiveTab(nextTab)
    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams)

        if (nextTab === 'profile') {
          nextParams.delete('tab')
        } else {
          nextParams.set('tab', nextTab)
        }

        return nextParams
      },
      { replace: true },
    )
  }

  function updateProfileField(field: keyof ProfileFormData, value: string) {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  function startEditingProfile() {
    setIsEditing(true)
    setProfileError(null)
  }

  function cancelEditingProfile() {
    setIsEditing(false)
    setProfileError(null)
    setFormData(createProfileFormData(user))
  }

  async function saveProfile() {
    setProfileError(null)
    setProfileSuccess(false)

    if (!formData.firstName.trim()) {
      setProfileError('Vui lòng nhập họ.')
      return
    }

    if (!formData.lastName.trim()) {
      setProfileError('Vui lòng nhập tên.')
      return
    }

    if (!user) {
      return
    }

    setProfileLoading(true)

    try {
      const updated = await authService.updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        defaultAddress: formData.address.trim(),
      })

      setUser({ ...user, ...updated })
      setIsEditing(false)
      setProfileSuccess(true)
      globalThis.setTimeout(() => setProfileSuccess(false), 3000)
    } catch (error: unknown) {
      setProfileError(mapProfileUpdateError(error))
    } finally {
      setProfileLoading(false)
    }
  }

  function updatePasswordField(field: keyof PasswordFormData, value: string) {
    setPasswordData((current) => ({ ...current, [field]: value }))
  }

  const submitPasswordChange: NonNullable<React.ComponentProps<'form'>['onSubmit']> = (event) => {
    event.preventDefault()

    void (async () => {
      if (!passwordData.currentPassword) {
        setPasswordError('Vui lòng nhập mật khẩu hiện tại.')
        return
      }

      const passwordChecks = getPasswordPolicyChecks(passwordData.newPassword)

      if (!passwordChecks.isValid) {
        setPasswordError(PASSWORD_POLICY_GUIDANCE)
        return
      }

      if (passwordData.newPassword !== passwordData.confirmNewPassword) {
        setPasswordError('Mật khẩu mới xác nhận không khớp.')
        return
      }

      if (passwordData.newPassword === passwordData.currentPassword) {
        setPasswordError('Mật khẩu mới phải khác mật khẩu hiện tại.')
        return
      }

      setPasswordError(null)
      setPasswordSuccess(false)
      setPasswordLoading(true)

      try {
        await authService.changePassword({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        })
        setPasswordSuccess(true)
        setPasswordData(INITIAL_PASSWORD_FORM_DATA)
      } catch (error: unknown) {
        setPasswordError(mapPasswordError(error))
      } finally {
        setPasswordLoading(false)
      }
    })()
  }

  async function handleLogout() {
    await logout()
    navigate(ROUTES.HOME)
  }

  return {
    user,
    activeTab,
    visibleTabs,
    profileState: {
      formData,
      isEditing,
      isLoading: profileLoading,
      error: profileError,
      success: profileSuccess,
      startEditing: startEditingProfile,
      cancelEditing: cancelEditingProfile,
      updateField: updateProfileField,
      save: saveProfile,
    },
    securityState: {
      formData: passwordData,
      isLoading: passwordLoading,
      error: passwordError,
      success: passwordSuccess,
      updateField: updatePasswordField,
      submit: submitPasswordChange,
    },
    reviews,
    isReviewsLoading,
    actions: {
      changeTab: handleTabChange,
      logout: handleLogout,
    },
  }
}