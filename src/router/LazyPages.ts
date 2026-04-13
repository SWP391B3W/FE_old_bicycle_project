import { lazy } from 'react';

// Lazy load all pages for code splitting
export const HomePage = lazy(() => import('../pages/HomePage'));
export const BikeListingPage = lazy(() => import('../pages/BikeListingPage'));
export const BikeDetailPage = lazy(() => import('../pages/BikeDetailPage'));
export const SellBikePage = lazy(() => import('../pages/SellBikePage'));
export const LoginPage = lazy(() => import('../pages/LoginPage'));
export const RegisterPage = lazy(() => import('../pages/RegisterPage'));
export const VerifyEmailPage = lazy(() => import('../pages/VerifyEmailPage'));
export const ProfilePage = lazy(() => import('../pages/ProfilePage'));
export const GuidePage = lazy(() => import('../pages/GuidePage'));
