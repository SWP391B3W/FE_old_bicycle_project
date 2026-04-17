import { lazy } from 'react';

// Lazy load all pages for code splitting
export const HomePage = lazy(() => import('../pages/HomePage'));
export const MarketPage = lazy(() => import('../pages/MarketPage'));
export const BikeDetailPage = lazy(() => import('../pages/BikeDetailPage'));
export const SellBikePage = lazy(() => import('../pages/SellBikePage'));
export const LoginPage = lazy(() => import('../pages/LoginPage'));
export const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
export const RegisterPage = lazy(() => import('../pages/register/RegisterPage'));
export const VerifyEmailPage = lazy(() => import('../pages/VerifyEmailPage'));
export const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
export const PaymentPage = lazy(() => import('../pages/PaymentPage'));
export const OrderConfirmationPage = lazy(() => import('../pages/OrderConfirmationPage'));
export const AdminCategoriesPage = lazy(() => import('../pages/admin/AdminCategoriesPage'));
export const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
export const AdminDisputesPage = lazy(() => import('../pages/admin/AdminDisputesPage'));
export const AdminListingsPage = lazy(() => import('../pages/admin/AdminListingsPage'));
export const AdminOrdersPage = lazy(() => import('../pages/admin/AdminOrdersPage'));
export const AdminPayoutsPage = lazy(() => import('../pages/admin/AdminPayoutsPage'));
export const AdminReportsPage = lazy(() => import('../pages/admin/AdminReportsPage'));
export const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
