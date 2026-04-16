import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
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
    AdminDashboardPage,
    AdminUsersPage,
    AdminOrdersPage,
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
                    <Route path={ROUTES.SELL} element={<SellBikePage />} />
                    <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                    <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
                    <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
                    <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
                    <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
                    <Route path={ROUTES.PAYMENT} element={<PaymentPage />} />
                    <Route path={ROUTES.ORDER_CONFIRMATION} element={<OrderConfirmationPage />} />
                </Route>

                {/* Admin routes */}
                <Route element={<AdminLayout />}>
                    <Route path={ROUTES.ADMIN} element={<AdminDashboardPage />} />
                    <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
                    <Route path={ROUTES.ADMIN_ORDERS} element={<AdminOrdersPage />} />
                    <Route path={ROUTES.ADMIN_LISTINGS} element={<AdminListingsPage />} />
                    <Route path={ROUTES.ADMIN_REPORTS} element={<AdminReportsPage />} />
                    <Route path={ROUTES.ADMIN_CATEGORIES} element={<AdminCategoriesPage />} />
                    <Route path={ROUTES.ADMIN_DISPUTES} element={<AdminDisputesPage />} />
                    <Route path={ROUTES.ADMIN_PAYOUTS} element={<AdminPayoutsPage />} />
                </Route>
            </Routes>
        </Suspense>
    );
}
