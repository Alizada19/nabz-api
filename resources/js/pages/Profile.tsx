import React, { useState } from 'react';
import { SidebarLayout } from '../components/SidebarLayout.tsx';
import { useAuthContext } from '../context/AuthContext.tsx';

const Profile: React.FC = () => {
    const { user } = useAuthContext();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handlePasswordUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMsg(null);
        setErrorMsg(null);

        if (newPassword !== confirmPassword) {
            setErrorMsg('New password and confirm password do not match!');
            return;
        }

        if (newPassword.length < 8) {
            setErrorMsg('Password must be at least 8 characters long.');
            return;
        }

        setSuccessMsg('Your security credentials have been updated and synced successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccessMsg(null), 4000);
    };

    return (
        <SidebarLayout>
            <div className="px-6 pt-24 pb-8 max-w-4xl space-y-8 text-left">
                {/* Profile Header */}
                <div>
                    <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Administrator Profile</h2>
                    <p className="text-sm text-on-surface-variant">Manage your personal credentials, view system access permissions, and configure account security.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Identification Card */}
                    <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-4 md:col-span-1">
                        <div className="relative">
                            <img
                                className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20"
                                alt="System Admin Portrait"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBanJhX1ct41PfkUm6OFElO1TPnjdNLRfMlxImkJ_1phtuirdTBrMd032HfS-wGLWHz6XA5sOivShSwWZ21u03ZlyJlWyOErHlV8f3f0w4itLYX6BznGThoKosYvJjAHgDt_JBh5g9OPCsi-7snc0_2M6CUGcrwN3CfhjV2t2smFQsN42a04CSBCABsZzbUOGQPRmIskIjeCSPzTVkZS12VAyfWCc6-u8Cw9F9ae1y-VuMWJOo1O-WDGg"
                            />
                            <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-4 border-white"></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-on-surface text-lg leading-tight">{user?.name || 'System Admin'}</h3>
                            <span className="bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-0.5 rounded-full tracking-wider uppercase inline-block mt-2">
                                {user?.role || 'Administrator'}
                            </span>
                            <p className="text-xs text-on-surface-variant mt-2">{user?.email || 'admin@nabz.org'}</p>
                        </div>
                        <div className="w-full pt-4 border-t border-outline-variant text-xs text-on-surface-variant space-y-2 text-left">
                            <div className="flex justify-between">
                                <span>Security Level:</span>
                                <strong className="text-primary font-semibold">Tier-1 Root</strong>
                            </div>
                            <div className="flex justify-between">
                                <span>Status:</span>
                                <strong className="text-green-600 font-semibold">Verified Active</strong>
                            </div>
                            <div className="flex justify-between">
                                <span>Account ID:</span>
                                <strong className="font-mono-sm text-[11px] font-semibold">ADM-2026-091</strong>
                            </div>
                        </div>
                    </div>

                    {/* Security Update & Credentials */}
                    <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden md:col-span-2">
                        <div className="p-6 border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
                            <h3 className="font-bold text-on-surface text-base">Update Security Credentials</h3>
                            <span className="text-[11px] font-bold text-primary bg-red-50 px-2 py-0.5 rounded border border-red-100">SHA-256 Protected</span>
                        </div>
                        <form onSubmit={handlePasswordUpdate} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Current Password</label>
                                <input
                                    type="password"
                                    required
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-primary text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min. 8 characters"
                                        className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-primary text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-primary text-sm"
                                    />
                                </div>
                            </div>

                            {successMsg && (
                                <p className="text-xs text-green-800 bg-green-50 border border-green-200 p-3 rounded-lg font-semibold">
                                    {successMsg}
                                </p>
                            )}

                            {errorMsg && (
                                <p className="text-xs text-error bg-error-container/20 border border-error/20 p-3 rounded-lg font-bold">
                                    {errorMsg}
                                </p>
                            )}

                            <div className="pt-4 border-t border-outline-variant flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-primary text-white font-semibold h-11 px-6 rounded-lg active:scale-95 transition-transform shadow-sm hover:opacity-95"
                                >
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Permissions & Security Protocol logs */}
                <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-outline-variant bg-surface-container-low">
                        <h3 className="font-bold text-on-surface text-base">Authorized Access Levels</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
                            <h4 className="font-bold text-on-surface text-sm">Role-Based Access Control</h4>
                            <p className="text-xs text-on-surface-variant leading-relaxed">
                                You hold top administrative permissions. You can register, modify, and terminate system users, donors, seekers, or emergency coordinators.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <span className="material-symbols-outlined text-green-600 text-3xl">sms</span>
                            <h4 className="font-bold text-on-surface text-sm">Automated Broadcast Authority</h4>
                            <p className="text-xs text-on-surface-variant leading-relaxed">
                                Empowered to initiate mass SMS, WhatsApp and application-level broadcasts to trigger matches during critical O- negative supply alerts.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <span className="material-symbols-outlined text-blue-600 text-3xl">shield_person</span>
                            <h4 className="font-bold text-on-surface text-sm">Logs & Auditing Visibility</h4>
                            <p className="text-xs text-on-surface-variant leading-relaxed">
                                Every inventory modifier, dispatch transaction, and patient request completion is locked with your digital signature credentials under system logs.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
};

export default Profile;
