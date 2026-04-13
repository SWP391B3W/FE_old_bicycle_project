import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import MainLayout from '../layouts/MainLayout';
import {
    HomePage,
    LoginPage,
} from './LazyPages';

export default function AppRouter() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                {/* Main layout routes */}
                <Route element={<MainLayout />}>
                    {/* Public routes */}
                    <Route path={ROUTES.HOME} element={<HomePage />} />
                    <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                </Route>
            </Routes>
        </Suspense>
    );
}
