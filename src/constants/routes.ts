// Route path constants for type-safe navigation
export const ROUTES = {
  HOME: '/',
  MARKET: '/mua-xe',
  BIKE_DETAIL: '/bikes/:id',
  SELL: '/ban-xe',
  NOTIFICATIONS: '/notifications',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  PROFILE: '/profile',
  PAYOUT: '/payout',
  MESSAGES: '/messages',
  ASSISTANT: '/assistant',
  GUIDE: '/guide',
  // Admin routes
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_LISTINGS: '/admin/listings',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_DISPUTES: '/admin/disputes',
  ADMIN_PAYOUTS: '/admin/payouts',
  // Inspector routes
  INSPECTOR: '/inspector',
  INSPECTOR_REQUESTS: '/inspector/requests',
  INSPECTOR_FORM: '/inspector/inspect/:id',
  INSPECTOR_HISTORY: '/inspector/history',
  // Seller routes
  SELLER: '/seller',
  SELLER_LISTINGS: '/seller/listings',
  SELLER_NEW_PRODUCT: '/seller/listings/new',
  SELLER_EDIT_PRODUCT: '/seller/listings/:id/edit',
  SELLER_ORDERS: '/seller/orders',
  // User routes
  WISHLIST: '/wishlist',
  CHECKOUT: '/thanh-toan-don-hang/:id',
  PAYMENT: '/thanh-toan/:id',
  ORDER_CONFIRMATION: '/xac-nhan-don-hang',
} as const;

// Helper function to build dynamic routes
export const buildRoute = {
  bikeDetail: (id: string | number) => `/bikes/${id}`,
  market: (params?: Record<string, string | number | null | undefined>) => {
    if (!params) {
      return ROUTES.MARKET
    }

    const nextParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return
      }

      nextParams.set(key, String(value))
    })

    const queryString = nextParams.toString()
    return queryString ? `${ROUTES.MARKET}?${queryString}` : ROUTES.MARKET
  },
  sellerNewProduct: () => ROUTES.SELLER_NEW_PRODUCT,
  sellerEditProduct: (id: string | number) => `/seller/listings/${id}/edit`,
  checkout: (id: string | number) => `/thanh-toan-don-hang/${id}`,
  payment: (id: string | number) => `/thanh-toan/${id}`,
};