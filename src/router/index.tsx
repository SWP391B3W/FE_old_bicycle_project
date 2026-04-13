import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import InspectorLayout from '../layouts/InspectorLayout';
import ProtectedRoute from './ProtectedRoute';

// Auth pages (lazy loaded)
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
import SellerLayout from '../layouts/SellerLayout';
import {
    HomePage,
    BikeListingPage,
    BikeDetailPage,
    SellBikePage,
    LoginPage,
    RegisterPage,
    VerifyEmailPage,
    ProfilePage,
    GuidePage,
} from './lazyPages';
import NotFoundPage from '../pages/NotFoundPage';

// Messages pages (lazy loaded)
const MessagesPage = lazy(() => import('../pages/messages/MessagesPage'));
const AssistantPage = lazy(() => import('../pages/AssistantPage'));

// User utility pages (lazy loaded)
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));
const MyReportsPage = lazy(() => import('../pages/MyReportsPage'));

// Admin pages (lazy loaded)
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminOrdersPage = lazy(() => import('../pages/admin/AdminOrdersPage'));
const AdminListingsPage = lazy(() => import('../pages/admin/AdminListingsPage'));
const AdminReportsPage = lazy(() => import('../pages/admin/AdminReportsPage'));
const AdminCategoriesPage = lazy(() => import('../pages/admin/AdminCategoriesPage'));
const AdminDisputesPage = lazy(() => import('../pages/admin/AdminDisputesPage'));
const AdminPayoutsPage = lazy(() => import('../pages/admin/AdminPayoutsPage'));

// Seller pages (lazy loaded)
const SellerDashboardPage = lazy(() => import('../pages/seller/SellerDashboardPage'));
const SellerListingsPage = lazy(() => import('../pages/seller/SellerListingsPage'));
const SellerEditProductPage = lazy(() => import('../pages/seller/SellerEditProductPage'));
const SellerOrdersPage = lazy(() => import('../pages/seller/SellerOrdersPage'));

// User pages (lazy loaded)
const WishlistPage = lazy(() => import('../pages/WishlistPage'));

// Inspector pages (lazy loaded)
const InspectorDashboardPage = lazy(() => import('../pages/inspector/InspectorDashboardPage'));
const InspectionRequestsPage = lazy(() => import('../pages/inspector/InspectionRequestsPage'));
const InspectionFormPage = lazy(() => import('../pages/inspector/InspectionFormPage'));
const InspectionHistoryPage = lazy(() => import('../pages/inspector/InspectionHistoryPage'));

import BikeLoader from '../components/common/BikeLoader';

// Loading fallback component


export default function AppRouter() {
    return (
        <Suspense fallback={<BikeLoader />}>
            <Routes>
                {/* Main layout routes */}
                <Route element={<MainLayout />}>
                    {/* Public routes */}
                    <Route path={ROUTES.HOME} element={<HomePage />} />
                    <Route path={ROUTES.MARKET} element={<BikeListingPage />} />
                    <Route path={ROUTES.BIKE_DETAIL} element={<BikeDetailPage />} />
                    <Route path={ROUTES.GUIDE} element={<GuidePage />} />
                    <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                    <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
                    <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                    {/* Protected routes - require authentication */}
                    <Route
                        path={ROUTES.SELL}
                        element={
                            <ProtectedRoute allowedRoles={['seller']}>
                                <SellBikePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.PROFILE}
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.MESSAGES}
                        element={
                            <ProtectedRoute>
                                <MessagesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.ASSISTANT}
                        element={
                            <ProtectedRoute>
                                <AssistantPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/notifications"
                        element={
                            <ProtectedRoute>
                                <NotificationsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/my-reports"
                        element={
                            <ProtectedRoute>
                                <MyReportsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.WISHLIST}
                        element={
                            <ProtectedRoute>
                                <WishlistPage />
                            </ProtectedRoute>
                        }
                    />
                </Route>

                {/* Admin layout routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
                    <Route path={ROUTES.ADMIN} element={<AdminDashboardPage />} />
                    <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
                    <Route path={ROUTES.ADMIN_ORDERS} element={<AdminOrdersPage />} />
                    <Route path={ROUTES.ADMIN_LISTINGS} element={<AdminListingsPage />} />
                    <Route path={ROUTES.ADMIN_REPORTS} element={<AdminReportsPage />} />
                    <Route path={ROUTES.ADMIN_CATEGORIES} element={<AdminCategoriesPage />} />
                    <Route path={ROUTES.ADMIN_DISPUTES} element={<AdminDisputesPage />} />
                    <Route path={ROUTES.ADMIN_PAYOUTS} element={<AdminPayoutsPage />} />
                </Route>

                {/* Seller layout routes (Protected) */}
                <Route element={<ProtectedRoute allowedRoles={['seller']}><SellerLayout /></ProtectedRoute>}>
                    <Route path={ROUTES.SELLER} element={<SellerDashboardPage />} />
                    <Route path={ROUTES.SELLER_LISTINGS} element={<SellerListingsPage />} />
                    <Route path={ROUTES.SELLER_NEW_PRODUCT} element={<SellBikePage />} />
                    <Route path={ROUTES.SELLER_EDIT_PRODUCT} element={<SellerEditProductPage />} />
                    <Route path={ROUTES.SELLER_ORDERS} element={<SellerOrdersPage />} />
                </Route>

                {/* Inspector layout routes */}
                <Route element={<ProtectedRoute allowedRoles={['inspector', 'admin']}><InspectorLayout /></ProtectedRoute>}>
                    <Route path={ROUTES.INSPECTOR} element={<InspectorDashboardPage />} />
                    <Route path={ROUTES.INSPECTOR_REQUESTS} element={<InspectionRequestsPage />} />
                    <Route path={ROUTES.INSPECTOR_FORM} element={<InspectionFormPage />} />
                    <Route path={ROUTES.INSPECTOR_HISTORY} element={<InspectionHistoryPage />} />
                </Route>

                {/* 404 fallback */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    );
}
