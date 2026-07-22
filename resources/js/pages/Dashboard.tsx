import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client.ts';
import { SidebarLayout } from '../components/SidebarLayout.tsx';
import { Link } from 'react-router-dom';

interface DashboardStats {
    total_users: number;
    total_donors: number;
    available_donors: number;
    requests_today: number;
    pending_requests: number;
    emergency_requests: number;
    monthly_requests: number[];
    blood_group_stats: { name: string; count: number; percentage: number }[];
    latest_emergency_requests: any[];
    latest_registered_donors: any[];
}

const Dashboard: React.FC = () => {
    // Fetch live dashboard analytics from the new Laravel API endpoint
    const { data: stats, isLoading } = useQuery<DashboardStats>({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const { data } = await apiClient.get('/dashboard-stats');
            return data.data;
        },
    });

    if (isLoading) {
        return (
            <SidebarLayout>
                <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                    <div className="flex flex-col items-center gap-4">
                        <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
                        <p className="text-on-surface-variant font-body-md">Retrieving live database analytics...</p>
                    </div>
                </div>
            </SidebarLayout>
        );
    }

    // Default fallbacks to match the gorgeous default content in code.html if data is empty
    const displayTotalUsers = stats?.total_users ?? 0;
    const displayTotalDonors = stats?.total_donors ?? 0;
    const displayAvailableDonors = stats?.available_donors ?? 0;
    const displayRequestsToday = stats?.requests_today ?? 0;
    const displayPendingRequests = stats?.pending_requests ?? 0;
    const displayEmergencyRequests = stats?.emergency_requests ?? 0;

    // Monthly blood requests array
    const monthlyRequests = stats?.monthly_requests || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const maxMonthlyValue = Math.max(...monthlyRequests, 1);

    // Blood groups stats list
    const bloodGroupStats = stats?.blood_group_stats || [];

    return (
        <SidebarLayout>
            <div className="px-6 pt-24 pb-8 space-y-8">
                {/* Statistics Bento Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                    {/* Total Users */}
                    <div className="glass-card p-5 rounded-xl flex flex-col justify-between border-t-2 border-primary bg-white shadow-sm">
                        <div className="flex justify-between items-start">
                            <span className="material-symbols-outlined text-primary">group</span>
                            <span className="font-mono-sm text-green-600 flex items-center gap-1 text-[10px]">
                                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                                +12%
                            </span>
                        </div>
                        <div>
                            <p className="font-label-md text-label-md text-on-surface-variant mt-2">Total Users</p>
                            <h3 className="font-display-lg text-display-lg text-on-surface mt-1">{displayTotalUsers}</h3>
                        </div>
                    </div>

                    {/* Total Donors */}
                    <div className="glass-card p-5 rounded-xl flex flex-col justify-between border-t-2 border-secondary bg-white shadow-sm">
                        <div className="flex justify-between items-start">
                            <span className="material-symbols-outlined text-secondary">volunteer_activism</span>
                            <span className="font-mono-sm text-green-600 flex items-center gap-1 text-[10px]">
                                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                                +5%
                            </span>
                        </div>
                        <div>
                            <p className="font-label-md text-label-md text-on-surface-variant mt-2">Total Donors</p>
                            <h3 className="font-display-lg text-display-lg text-on-surface mt-1">{displayTotalDonors}</h3>
                        </div>
                    </div>

                    {/* Available Donors */}
                    <div className="glass-card p-5 rounded-xl flex flex-col justify-between border-t-2 border-tertiary bg-white shadow-sm">
                        <div className="flex justify-between items-start">
                            <span className="material-symbols-outlined text-tertiary">check_circle</span>
                        </div>
                        <div>
                            <p className="font-label-md text-label-md text-on-surface-variant mt-2">Available Donors</p>
                            <h3 className="font-display-lg text-display-lg text-on-surface mt-1">{displayAvailableDonors}</h3>
                        </div>
                    </div>

                    {/* Requests Today */}
                    <div className="glass-card p-5 rounded-xl flex flex-col justify-between border-t-2 border-primary-container bg-white shadow-sm">
                        <div className="flex justify-between items-start">
                            <span className="material-symbols-outlined text-primary-container">history</span>
                        </div>
                        <div>
                            <p className="font-label-md text-label-md text-on-surface-variant mt-2">Requests Today</p>
                            <h3 className="font-display-lg text-display-lg text-on-surface mt-1">{displayRequestsToday}</h3>
                        </div>
                    </div>

                    {/* Pending Requests */}
                    <div className="glass-card p-5 rounded-xl flex flex-col justify-between border-t-2 border-surface-dim bg-white shadow-sm">
                        <div className="flex justify-between items-start">
                            <span className="material-symbols-outlined text-on-surface-variant">pending</span>
                        </div>
                        <div>
                            <p className="font-label-md text-label-md text-on-surface-variant mt-2">Pending</p>
                            <h3 className="font-display-lg text-display-lg text-on-surface mt-1">{displayPendingRequests}</h3>
                        </div>
                    </div>

                    {/* Emergency Requests */}
                    <div className="glass-card p-5 rounded-xl flex flex-col justify-between bg-error-container border-t-2 border-error shadow-sm">
                        <div className="flex justify-between items-start">
                            <span className="material-symbols-outlined text-error">emergency</span>
                            <span className="animate-pulse bg-error h-2 w-2 rounded-full"></span>
                        </div>
                        <div>
                            <p className="font-label-md text-label-md text-on-error-container mt-2">Emergency</p>
                            <h3 className="font-display-lg text-display-lg text-error mt-1">
                                {displayEmergencyRequests < 10 ? `0${displayEmergencyRequests}` : displayEmergencyRequests}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Monthly Blood Requests Chart */}
                    <div className="lg:col-span-8 glass-card p-6 rounded-xl bg-white shadow-sm border border-outline-variant">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h4 className="font-headline-md text-headline-md text-on-surface">Monthly Blood Requests</h4>
                                <p className="font-body-md text-body-md text-on-surface-variant">Live trends for the current year</p>
                            </div>
                            <select className="bg-surface border-outline-variant rounded-lg font-label-md text-label-md focus:ring-primary focus:border-primary outline-none px-3 py-1.5">
                                <option>Year 2026</option>
                                <option>Year 2025</option>
                            </select>
                        </div>
                        <div className="h-64 flex items-end justify-between gap-2 px-2">
                            {/* Visual chart bar columns bound to database data */}
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((monthName, i) => {
                                const val = monthlyRequests[i] || 0;
                                const heightPercentage = Math.round((val / maxMonthlyValue) * 100);
                                return (
                                    <div key={i} className="group relative flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full bg-primary-container/20 rounded-t-lg relative h-48">
                                            <div
                                                className="absolute bottom-0 w-full bg-primary-container rounded-t-lg transition-all duration-500 hover:opacity-80"
                                                style={{ height: `${heightPercentage}%` }}
                                                title={`${val} requests`}
                                            ></div>
                                        </div>
                                        <span className="font-label-md text-[10px] text-on-surface-variant">{monthName}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Blood Group Donut Stock Level */}
                    <div className="lg:col-span-4 glass-card p-6 rounded-xl flex flex-col bg-white shadow-sm border border-outline-variant">
                        <h4 className="font-headline-md text-headline-md text-on-surface mb-1">Blood Groups</h4>
                        <p className="font-body-md text-body-md text-on-surface-variant mb-6">Stock level per type</p>
                        <div className="flex-1 flex flex-col justify-center items-center relative">
                            {/* Custom CSS Donut Visualization */}
                            <div className="w-40 h-40 rounded-full border-[12px] border-primary border-r-secondary border-b-tertiary border-l-surface-variant flex items-center justify-center relative">
                                <div className="text-center">
                                    <span className="font-headline-lg text-headline-lg block">85%</span>
                                    <span className="font-label-md text-label-md text-on-surface-variant">Optimal</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-8 w-full">
                                {bloodGroupStats.slice(0, 4).map((typeStat, index) => {
                                    const colors = ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-surface-variant'];
                                    return (
                                        <div key={index} className="flex items-center gap-2">
                                            <span className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></span>
                                            <span className="font-label-md text-label-md">{typeStat.name} ({typeStat.percentage}%)</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Latest Emergency Requests Widget */}
                    <div className="glass-card rounded-xl overflow-hidden bg-white shadow-sm border border-outline-variant">
                        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                            <h4 className="font-headline-md text-headline-md text-error flex items-center gap-2">
                                <span className="material-symbols-outlined">emergency</span>
                                Latest Emergency Requests
                            </h4>
                            <Link to="/blood-requests" className="text-primary font-label-md text-label-md hover:underline">View All</Link>
                        </div>
                        <div className="divide-y divide-outline-variant">
                            {stats?.latest_emergency_requests.length === 0 ? (
                                <div className="p-8 text-center text-on-surface-variant text-sm font-medium">
                                    No emergency requests currently active.
                                </div>
                            ) : (
                                stats?.latest_emergency_requests.map((req, idx) => (
                                    <div key={idx} className="p-4 flex items-center gap-4 hover:bg-surface-container-lowest transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center text-error font-bold">
                                            {req.blood_type?.name || 'Any'}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-body-md text-body-md font-semibold text-on-surface">{req.hospital_name}</p>
                                            <p className="font-label-md text-label-md text-on-surface-variant">
                                                {req.units_required} units • {req.urgency_level.toUpperCase()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-label-md text-label-md font-bold text-error">URGENT</p>
                                            <p className="font-mono-sm text-on-surface-variant text-[10px]">{req.created_at}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Latest Registered Donors Widget */}
                    <div className="glass-card rounded-xl overflow-hidden bg-white shadow-sm border border-outline-variant">
                        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                            <h4 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                                <span className="material-symbols-outlined">person_add</span>
                                Latest Registered Donors
                            </h4>
                            <Link to="/donors" className="text-primary font-label-md text-label-md hover:underline">View All</Link>
                        </div>
                        <div className="divide-y divide-outline-variant">
                            {stats?.latest_registered_donors.length === 0 ? (
                                <div className="p-8 text-center text-on-surface-variant text-sm font-medium">
                                    No donors registered in the system yet.
                                </div>
                            ) : (
                                stats?.latest_registered_donors.map((donor, idx) => (
                                    <div key={idx} className="p-4 flex items-center gap-4 hover:bg-surface-container-lowest transition-colors">
                                        <span className="material-symbols-outlined text-4xl text-on-surface-variant">account_circle</span>
                                        <div className="flex-1 text-left">
                                            <p className="font-body-md text-body-md font-semibold text-on-surface">{donor.name}</p>
                                            <p className="font-label-md text-label-md text-on-surface-variant">
                                                Blood Type: {donor.blood_type?.name || 'O-'} | {donor.location || 'Unknown'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold">VERIFIED</span>
                                            <p className="font-mono-sm text-on-surface-variant text-[10px] mt-1">{donor.created_at}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
};

export default Dashboard;
