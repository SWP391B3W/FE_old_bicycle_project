import { Outlet } from 'react-router-dom'

export default function MainLayout() {
    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    )
}
