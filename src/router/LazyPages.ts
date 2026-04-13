import { lazy } from 'react';

// Lazy load all pages for code splitting
export const HomePage = lazy(() => import('../pages/HomePage'));
export const MarketPage = lazy(() => import('../pages/MarketPage'));
export const BikeDetailPage = lazy(() => import('../pages/BikeDetailPage'));
export const SellBikePage = lazy(() => import('../pages/SellBikePage'));
export const LoginPage = lazy(() => import('../pages/LoginPage'));
export const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
export const RegisterPage = lazy(() => import('../pages/register/RegisterPage'));
