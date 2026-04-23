import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import InspectorLayout from '../layouts/InspectorLayout';
import SellerLayout from '../layouts/SellerLayout';
import ProtectedRoute from './ProtectedRoute';
import {
    HomePage,
    MarketPage,
    BikeDetailPage,
    SellBikePage,
    LoginPage,
    ForgotPasswordPage,
    RegisterPage,
    VerifyEmailPage,
    CheckoutPage,
    PaymentPage,
    OrderConfirmationPage,
    ProfilePage,
    PayoutPage,
    AdminDashboardPage,
    AdminUsersPage,
    AdminOrdersPage,
    AdminListingsPage,
    AdminReportsPage,
    AdminCategoriesPage,
    AdminDisputesPage,
    AdminPayoutsPage,
    AdminSettingsPage,
    GuidePage,
    MessagesPage,
    InspectorDashboardPage,
    InspectionRequestsPage,
    InspectionFormPage,
    InspectionHistoryPage,
    SellerDashboardPage,
    SellerListingsPage,
    SellerEditProductPage,
    SellerOrdersPage,
} from './LazyPages';

export default function AppRouter() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                {/* Main layout routes */}
                <Route element={<MainLayout />}>
                    {/* Public routes */}
                    <Route path={ROUTES.HOME} element={<HomePage />} />
                    <Route path={ROUTES.MARKET} element={<MarketPage />} />
                    <Route path={ROUTES.BIKE_DETAIL} element={<BikeDetailPage />} />
                    <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                    <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
                    <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
                    <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
                    <Route path={ROUTES.GUIDE} element={<GuidePage />} />

                    {/* Protected general routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
                        <Route path={ROUTES.PAYMENT} element={<PaymentPage />} />
                        <Route path={ROUTES.ORDER_CONFIRMATION} element={<OrderConfirmationPage />} />
                        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
                        <Route path={ROUTES.PAYOUT} element={<PayoutPage />} />
                        <Route path={ROUTES.MESSAGES} element={<MessagesPage />} />
                    </Route>

                    <Route
                        path={ROUTES.SELL}
                        element={
                            <ProtectedRoute allowedRoles={['seller']}>
                                <SellBikePage />
                            </ProtectedRoute>
                        }
                    />
                </Route>

                {/* Inspector routes */}
                <Route
                    element={
                        <ProtectedRoute allowedRoles={['inspector']}>
                            <InspectorLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path={ROUTES.INSPECTOR} element={<InspectorDashboardPage />} />
                    <Route path={ROUTES.INSPECTOR_REQUESTS} element={<InspectionRequestsPage />} />
                    <Route path={ROUTES.INSPECTOR_FORM} element={<InspectionFormPage />} />
                    <Route path={ROUTES.INSPECTOR_HISTORY} element={<InspectionHistoryPage />} />
                </Route>

                {/* Seller routes */}
                <Route
                    element={
                        <ProtectedRoute allowedRoles={['seller']}>
                            <SellerLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path={ROUTES.SELLER} element={<SellerDashboardPage />} />
                    <Route path={ROUTES.SELLER_LISTINGS} element={<SellerListingsPage />} />
                    <Route path={ROUTES.SELLER_NEW_PRODUCT} element={<SellBikePage />} />
                    <Route path={ROUTES.SELLER_EDIT_PRODUCT} element={<SellerEditProductPage />} />
                    <Route path={ROUTES.SELLER_ORDERS} element={<SellerOrdersPage />} />
                </Route>



                <Route
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path={ROUTES.ADMIN} element={<AdminDashboardPage />} />
                    <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
                    <Route path={ROUTES.ADMIN_ORDERS} element={<AdminOrdersPage />} />
                    <Route path={ROUTES.ADMIN_LISTINGS} element={<AdminListingsPage />} />
                    <Route path={ROUTES.ADMIN_REPORTS} element={<AdminReportsPage />} />
                    <Route path={ROUTES.ADMIN_CATEGORIES} element={<AdminCategoriesPage />} />
                    <Route path={ROUTES.ADMIN_DISPUTES} element={<AdminDisputesPage />} />
                    <Route path={ROUTES.ADMIN_PAYOUTS} element={<AdminPayoutsPage />} />
                    <Route path={ROUTES.ADMIN_SETTINGS} element={<AdminSettingsPage />} />
                </Route>
            </Routes>
        </Suspense>
    );
}
