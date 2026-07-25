import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext.tsx';

export const ProtectedRoute: React.FC = () => {
    const { token, isLoading } = useAuthContext();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
                    <p className="font-body-md text-on-surface-variant">Loading Admin Gateway...</p>
                </div>
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export const GuestRoute: React.FC = () => {
    const { token, isLoading } = useAuthContext();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
                    <p className="font-body-md text-on-surface-variant">Checking authorization...</p>
                </div>
            </div>
        );
    }

    if (token) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
