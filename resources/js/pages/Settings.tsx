import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client.ts';
import { SidebarLayout } from '../components/SidebarLayout.tsx';
import { useAuthContext } from '../context/AuthContext.tsx';

interface DonorProfile {
    id: number;
    blood_type: {
        id: number;
        name: string;
    };
    last_donation_date: string | null;
    total_donations: number;
    available_status: number;
    is_available: boolean;
}

const Settings: React.FC = () => {
    const { user, login } = useAuthContext();
    const queryClient = useQueryClient();

    // Local profile info state
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [locationInput, setLocationInput] = useState(user?.location || '');
    const [bloodTypeId, setBloodTypeId] = useState('1');
    const [availableStatus, setAvailableStatus] = useState('1');
    const [totalDonations, setTotalDonations] = useState('0');
    const [lastDonationDate, setLastDonationDate] = useState('');
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Fetch user donor-profile
    const { data: donorProfile, isLoading } = useQuery<DonorProfile>({
        queryKey: ['donor-profile'],
        queryFn: async () => {
            const { data } = await apiClient.get('/donor-profile');
            return data.data;
        },
        enabled: user?.role === 'donor',
    });

    useEffect(() => {
        if (donorProfile) {
            setBloodTypeId(String(donorProfile.blood_type.id));
            setAvailableStatus(String(donorProfile.available_status));
            setTotalDonations(String(donorProfile.total_donations));
            setLastDonationDate(donorProfile.last_donation_date || '');
        }
    }, [donorProfile]);

    const updateProfileMutation = useMutation({
        mutationFn: async (profileData: any) => {
            const { data } = await apiClient.put('/donor-profile', profileData);
            return data;
        },
        onSuccess: (data) => {
            setSuccessMsg('Your clinical donor profile has been updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['donor-profile'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
        onError: (err: any) => {
            setErrorMsg(err.response?.data?.message || 'Error occurred while saving clinical configuration.');
        },
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMsg(null);
        setErrorMsg(null);

        updateProfileMutation.mutate({
            blood_type_id: parseInt(bloodTypeId),
            available_status: parseInt(availableStatus),
            total_donations: parseInt(totalDonations),
            last_donation_date: lastDonationDate || null,
        });
    };

    return (
        <SidebarLayout>
            <div className="px-6 pt-8 pb-8 max-w-4xl space-y-6">
                <div>
                    <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Clinical Settings & Profile Setup</h2>
                    <p className="text-sm text-on-surface-variant">Configure hospital/clinic administration settings or donor credentials.</p>
                </div>

                <div className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden divide-y divide-outline-variant">
                    {/* User profile identification card */}
                    <div className="p-6 bg-surface-container-low flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-bold text-2xl shadow-md">
                            {user?.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-on-surface text-lg">{user?.name}</h3>
                            <p className="text-xs text-on-surface-variant uppercase mt-0.5 font-semibold tracking-wider">
                                {user?.role} Portal
                            </p>
                            <p className="text-xs text-on-surface-variant mt-0.5">{user?.email}</p>
                        </div>
                    </div>

                    {/* Donor details card */}
                    {user?.role === 'donor' && (
                        <form onSubmit={handleSave} className="p-6 space-y-6">
                            <h4 className="font-bold text-primary font-headline-md text-headline-md flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">volunteer_activism</span>
                                Blood Donor Profile Settings
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Blood Type Group</label>
                                    <select
                                        value={bloodTypeId}
                                        onChange={(e) => setBloodTypeId(e.target.value)}
                                        className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-secondary text-sm"
                                    >
                                        <option value="1">O-</option>
                                        <option value="2">O+</option>
                                        <option value="3">A-</option>
                                        <option value="4">A+</option>
                                        <option value="5">B-</option>
                                        <option value="6">B+</option>
                                        <option value="7">AB-</option>
                                        <option value="8">AB+</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Availability Status</label>
                                    <select
                                        value={availableStatus}
                                        onChange={(e) => setAvailableStatus(e.target.value)}
                                        className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-secondary text-sm"
                                    >
                                        <option value="1">Available (Immediately Matching)</option>
                                        <option value="0">Unavailable</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Donation Pints (Lifetime)</label>
                                    <input
                                        type="number"
                                        value={totalDonations}
                                        onChange={(e) => setTotalDonations(e.target.value)}
                                        className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-secondary text-sm"
                                        min="0"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Last Donation Date</label>
                                    <input
                                        type="date"
                                        value={lastDonationDate}
                                        onChange={(e) => setLastDonationDate(e.target.value)}
                                        className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-secondary text-sm"
                                    />
                                </div>
                            </div>

                            {successMsg && (
                                <p className="text-xs text-green-800 font-bold bg-green-100 p-3 rounded-lg border border-green-200">
                                    {successMsg}
                                </p>
                            )}

                            {errorMsg && (
                                <p className="text-xs text-error font-bold bg-error-container/20 p-3 rounded-lg border border-error/20">
                                    {errorMsg}
                                </p>
                            )}

                            <div className="flex justify-end pt-4 border-t border-outline-variant">
                                <button
                                    type="submit"
                                    disabled={updateProfileMutation.isPending}
                                    className="bg-primary text-on-primary h-11 px-6 rounded-lg font-semibold active:scale-95 transition-transform"
                                >
                                    {updateProfileMutation.isPending ? 'Updating...' : 'Save Settings'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Standard details (Admin or Seekers without donor profile setup) */}
                    {user?.role !== 'donor' && (
                        <div className="p-6 space-y-4">
                            <h4 className="font-bold text-primary font-headline-md text-headline-md flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">shield</span>
                                Administrative Configuration
                            </h4>
                            <p className="text-sm text-on-surface-variant leading-relaxed">
                                As an administrative system user, your parameters are restricted and fully protected. Global logs, hospitals, donor matching systems, and requests can be managed natively from the dashboard side navigation pane.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </SidebarLayout>
    );
};

export default Settings;
