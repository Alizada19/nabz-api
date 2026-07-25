import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext.tsx';
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute.tsx';
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Users from './pages/Users.tsx';
import Donors from './pages/Donors.tsx';
import BloodRequests from './pages/BloodRequests.tsx';
import Notifications from './pages/Notifications.tsx';
import Settings from './pages/Settings.tsx';
import BloodTypes from './pages/BloodTypes.tsx';
import Reports from './pages/Reports.tsx';
import Profile from './pages/Profile.tsx';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Guest Routes */}
                        <Route element={<GuestRoute />}>
                            <Route path="/login" element={<Login />} />
                        </Route>

                        {/* Protected Routes */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/users" element={<Users />} />
                            <Route path="/donors" element={<Donors />} />
                            <Route path="/blood-requests" element={<BloodRequests />} />
                            <Route path="/blood-types" element={<BloodTypes />} />
                            <Route path="/notifications" element={<Notifications />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/profile" element={<Profile />} />
                        </Route>

                        {/* Catch-all */}
                        <Route path="*" element={<div className="p-6">Page Not Found</div>} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </QueryClientProvider>
    );
};

export default App;
