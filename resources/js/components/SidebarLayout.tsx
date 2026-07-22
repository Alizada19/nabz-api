import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext.tsx';
import { useLogout } from '../hooks/useAuth.ts';

interface LayoutProps {
    children: React.ReactNode;
}

export const SidebarLayout: React.FC<LayoutProps> = ({ children }) => {
    const { user } = useAuthContext();
    const logoutMutation = useLogout();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logoutMutation.mutate(undefined, {
            onSuccess: () => {
                navigate('/login');
            }
        });
    };

    const mainNavigationItems = [
        { name: 'Dashboard', icon: 'dashboard', path: '/' },
        { name: 'Users', icon: 'group', path: '/users' },
        { name: 'Donors', icon: 'volunteer_activism', path: '/donors' },
        { name: 'Seekers', icon: 'person_search', path: '/users?role=seeker' },
        { name: 'Blood Requests', icon: 'bloodtype', path: '/blood-requests' },
        { name: 'Blood Types', icon: 'opacity', path: '/settings' },
        { name: 'Notifications', icon: 'notifications', path: '/notifications' },
        { name: 'Reports', icon: 'assessment', path: '/' },
    ];

    const bottomNavigationItems = [
        { name: 'Settings', icon: 'settings', path: '/settings' },
        { name: 'Profile', icon: 'account_circle', path: '/settings' },
    ];

    const isActive = (path: string) => {
        const currentPath = location.pathname + location.search;
        if (path === '/') {
            return currentPath === '/';
        }
        return currentPath.startsWith(path);
    };

    return (
        <div className="bg-background text-on-surface font-body-md min-h-screen">
            {/* Desktop Navigation Drawer */}
            <aside className="fixed left-0 top-0 h-full hidden md:flex flex-col w-sidebar-width border-r border-outline-variant bg-surface shadow-sm z-50">
                <div className="p-6">
                    <h1 className="font-headline-md text-headline-md font-bold text-primary">HEMOGLOBIN ADMIN</h1>
                </div>
                <nav className="flex-1 px-4 space-y-1">
                    {mainNavigationItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 transition-colors duration-200 ease-in-out ${
                                isActive(item.path)
                                    ? 'bg-surface-container-highest text-primary border-l-4 border-primary font-semibold'
                                    : 'text-on-surface-variant hover:bg-surface-container-low'
                            }`}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span className="font-body-md text-body-md">{item.name}</span>
                        </Link>
                    ))}
                    <div className="pt-4 mt-4 border-t border-outline-variant">
                        {bottomNavigationItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 transition-colors duration-200 ease-in-out ${
                                    isActive(item.path)
                                        ? 'bg-surface-container-highest text-primary border-l-4 border-primary font-semibold'
                                        : 'text-on-surface-variant hover:bg-surface-container-low'
                                }`}
                            >
                                <span className="material-symbols-outlined">{item.icon}</span>
                                <span className="font-body-md text-body-md">{item.name}</span>
                            </Link>
                        ))}
                    </div>
                </nav>
                <div className="p-4 border-t border-outline-variant">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container/20 rounded-lg transition-colors duration-200 ease-in-out text-left"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        <span className="font-body-md text-body-md">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Navigation Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 flex justify-around items-center px-4 pb-safe bg-surface border-t border-outline-variant shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
                {mainNavigationItems.slice(0, 5).map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`flex flex-col items-center justify-center transition-transform active:scale-90 ${
                            isActive(item.path)
                                ? 'bg-primary-container text-on-primary rounded-xl px-3 py-1'
                                : 'text-on-surface-variant hover:bg-surface-container-high'
                        }`}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="font-label-md text-[10px]">{item.name.split(' ')[0]}</span>
                    </Link>
                ))}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-transform active:scale-90"
                >
                    <span className="material-symbols-outlined">menu</span>
                    <span className="font-label-md text-[10px]">Menu</span>
                </button>
            </nav>

            {/* Mobile Menu Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
                    <div
                        className="fixed bottom-16 left-0 w-full bg-surface border-t border-outline-variant p-4 space-y-2 rounded-t-2xl shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
                            <span className="font-bold text-on-surface">{user?.name || 'Admin'}</span>
                            <span className="text-xs text-on-surface-variant">{user?.role?.toUpperCase()}</span>
                        </div>
                        {bottomNavigationItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low rounded-lg"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span className="material-symbols-outlined">{item.icon}</span>
                                <span>{item.name}</span>
                            </Link>
                        ))}
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                handleLogout();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container/20 rounded-lg text-left"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Top AppBar */}
            <header className="fixed top-0 right-0 w-full md:w-[calc(100%-260px)] h-16 z-40 flex items-center justify-between px-6 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
                <div className="flex items-center gap-4">
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 active:scale-95 transition-transform">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <h2 className="font-headline-md text-headline-md text-primary font-bold">Welcome back, {user?.name || 'Admin'}.</h2>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-surface-container-low rounded-full transition-transform active:scale-95">
                        <span className="material-symbols-outlined">search</span>
                    </button>
                    <Link to="/settings" className="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-container-low rounded-full transition-transform active:scale-95 border border-outline-variant">
                        <img
                            className="w-7 h-7 rounded-full object-cover"
                            alt="A professional headshot of a senior medical administrator"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBanJhX1ct41PfkUm6OFElO1TPnjdNLRfMlxImkJ_1phtuirdTBrMd032HfS-wGLWHz6XA5sOivShSwWZ21u03ZlyJlWyOErHlV8f3f0w4itLYX6BznGThoKosYvJjAHgDt_JBh5g9OPCsi-7snc0_2M6CUGcrwN3CfhjV2t2smFQsN42a04CSBCABsZzbUOGQPRmIskIjeCSPzTVkZS12VAyfWCc6-u8Cw9F9ae1y-VuMWJOo1O-WDGg"
                        />
                        <span className="hidden sm:inline font-label-md text-label-md">Profile</span>
                    </Link>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="md:ml-[260px] min-h-screen pt-16 pb-20 md:pb-8 bg-background">
                {children}
            </main>
        </div>
    );
};
