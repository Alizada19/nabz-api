import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth.ts';
import { useAuthContext } from '../context/AuthContext.tsx';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const loginMutation = useLogin();
    const { login: contextLogin } = useAuthContext();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        loginMutation.mutate(
            { email, password },
            {
                onSuccess: (response) => {
                    if (response.success && response.data.token) {
                        contextLogin(response.data.token, response.data.user);
                        navigate('/');
                    } else {
                        setError('Invalid credentials or unexpected API response.');
                    }
                },
                onError: (err: any) => {
                    const message = err.response?.data?.message || 'The credentials provided do not match our secure records. Please check your administrative token.';
                    setError(message);
                },
            }
        );
    };

    return (
        <div className="bg-background font-body-md text-on-background min-h-screen flex items-center justify-center p-4">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md z-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary-container rounded-xl flex items-center justify-center shadow-lg mb-4">
                        <span className="material-symbols-outlined text-on-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>bloodtype</span>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg tracking-tight text-on-surface">HEMOGLOBIN ADMIN</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">Clinical Logistics &amp; Donor Management</p>
                </div>

                <div className="bg-white border border-outline-variant rounded-xl shadow-xl p-8 overflow-hidden">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2" htmlFor="email">
                                <span className="material-symbols-outlined text-[18px]">mail</span>
                                Email Address
                            </label>
                            <input
                                className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@hemoglobin.org"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2" htmlFor="password">
                                    <span className="material-symbols-outlined text-[18px]">lock</span>
                                    Password
                                </label>
                                <span className="text-secondary font-label-md text-label-md hover:underline cursor-pointer">Forgot Password?</span>
                            </div>
                            <div className="relative">
                                <input
                                    className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md pr-12"
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 transition-all cursor-pointer"
                                id="remember"
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                            />
                            <label className="font-label-md text-label-md text-on-surface-variant select-none cursor-pointer" htmlFor="remember">
                                Remember this device for 30 days
                            </label>
                        </div>

                        <button
                            className="w-full h-12 bg-primary-container text-on-primary font-headline-md text-headline-md rounded-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200"
                            type="submit"
                            disabled={loginMutation.isPending}
                        >
                            <span>{loginMutation.isPending ? 'Logging in...' : 'Login to Dashboard'}</span>
                            {loginMutation.isPending && (
                                <span className="animate-spin">
                                    <span className="material-symbols-outlined">progress_activity</span>
                                </span>
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-6 p-4 rounded-lg bg-error-container/30 border border-error/20 text-error flex gap-3 items-start">
                            <span className="material-symbols-outlined mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                            <div className="text-sm">
                                <p className="font-bold">Access Denied</p>
                                <p className="text-xs opacity-80">{error}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center space-y-4">
                    <div className="flex items-center justify-center gap-6">
                        <div className="flex flex-col items-center">
                            <span className="text-secondary font-display-lg text-display-lg">2.4k</span>
                            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Units Managed</span>
                        </div>
                        <div className="w-px h-10 bg-outline-variant"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-primary font-display-lg text-display-lg">15m</span>
                            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Avg. Response</span>
                        </div>
                    </div>
                    <p className="text-[11px] text-on-surface-variant opacity-60">
                        © 2024 Hemoglobin Health Systems. Secure Admin Gateway v4.2.1
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
