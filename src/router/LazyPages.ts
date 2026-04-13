import { lazy } from 'react';

// Lazy load all pages for code splitting
export const HomePage = lazy(() => import('../pages/HomePage'));
export const LoginPage = lazy(() => import('../pages/LoginPage'));
