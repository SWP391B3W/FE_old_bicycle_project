import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import MainLayout from '../layouts/MainLayout';
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
                        <Route path={ROUTES.SELL} element={<SellBikePage />} />
                        <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
                        <Route path={ROUTES.PAYMENT} element={<PaymentPage />} />
                        <Route path={ROUTES.ORDER_CONFIRMATION} element={<OrderConfirmationPage />} />
                        <Route path={ROUTES.MESSAGES} element={<MessagesPage />} />
                    </Route>
                </Route>

                {/* Inspector routes */}
                <Route
                    element={
                        <ProtectedRoute allowedRoles={['INSPECTOR']}>
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
                        <ProtectedRoute allowedRoles={['SELLER']}>
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
            </Routes>
        </Suspense>
    );
}
