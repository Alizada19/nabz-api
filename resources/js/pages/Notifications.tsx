import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client.ts';
import { SidebarLayout } from '../components/SidebarLayout.tsx';

interface Notification {
    id: string;
    type: string;
    notifiable_type: string;
    notifiable_id: number;
    data: {
        title: string;
        message: string;
        blood_request_id?: number;
    };
    read_at: string | null;
    created_at: string;
}

interface PaginatedNotifications {
    success: boolean;
    data: Notification[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        unread_count: number;
    };
}

const Notifications: React.FC = () => {
    const queryClient = useQueryClient();

    const { data: notifData, isLoading } = useQuery<PaginatedNotifications>({
        queryKey: ['notifications-list'],
        queryFn: async () => {
            const { data } = await apiClient.get('/notifications');
            return data;
        }
    });

    const readMutation = useMutation({
        mutationFn: async (id: string) => {
            const { data } = await apiClient.patch(`/notifications/${id}/read`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
        }
    });

    const readAllMutation = useMutation({
        mutationFn: async () => {
            const { data } = await apiClient.post('/notifications/read-all');
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
        }
    });

    const handleMarkAsRead = (id: string) => {
        readMutation.mutate(id);
    };

    const handleMarkAllAsRead = () => {
        readAllMutation.mutate();
    };

    return (
        <SidebarLayout>
            <div className="px-6 pt-24 pb-8 space-y-6 text-left">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Clinical Alerts & Notifications</h2>
                        <p className="text-sm text-on-surface-variant">Stay updated with blood donation and match tracking.</p>
                    </div>
                    {notifData?.meta.unread_count && notifData.meta.unread_count > 0 ? (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="bg-secondary-container/20 text-secondary hover:bg-secondary-container/30 px-4 py-2 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
                        >
                            Mark All As Read
                        </button>
                    ) : null}
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-outline-variant shadow-sm">
                        <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
                        <p className="text-on-surface-variant mt-4 font-body-md">Retrieving alerts...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {notifData?.data.length === 0 ? (
                            <>
                                {/* Default beautiful alerts matching code.html when no API data exists */}
                                <div className="relative bg-white border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start overflow-hidden group">
                                    <div className="absolute left-0 top-0 w-1.5 h-full bg-primary"></div>
                                    <div className="flex-shrink-0 bg-primary-fixed p-3 rounded-xl text-primary">
                                        <span className="material-symbols-outlined text-[32px]">priority_high</span>
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Critical Supply Shortage: O- Negative</h3>
                                            <span className="font-mono-sm text-mono-sm text-on-surface-variant bg-surface-container px-2 py-1 rounded">2 min ago</span>
                                        </div>
                                        <p className="font-body-lg text-body-lg mt-2 text-on-surface-variant">St. Jude's Medical Center has reported zero units of O- blood. Immediate dispatch required from regional warehouse.</p>
                                        <div className="mt-4 flex gap-3">
                                            <button className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:brightness-110 active:scale-[0.97] transition-all">Dispatch Now</button>
                                            <button className="px-4 py-2 border border-outline text-on-surface-variant font-label-md text-label-md rounded-lg hover:bg-surface-container-low active:scale-[0.97] transition-all">Ignore</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm relative group">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-secondary-container p-2 rounded-lg text-on-secondary-container flex items-center justify-center">
                                                <span className="material-symbols-outlined">person_add</span>
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between">
                                                    <h4 className="font-headline-md text-headline-md font-bold text-on-surface">New Donor Registered</h4>
                                                    <span className="font-mono-sm text-mono-sm text-on-surface-variant">1 hour ago</span>
                                                </div>
                                                <p className="font-body-md text-body-md text-on-surface-variant mt-1">James Wilson (Type A+) just registered via the mobile app. Profile verification pending.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm relative group opacity-75">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-surface-container-high p-2 rounded-lg text-on-surface-variant flex items-center justify-center">
                                                <span className="material-symbols-outlined">history</span>
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between">
                                                    <h4 className="font-headline-md text-headline-md font-bold text-on-surface">Daily Report Ready</h4>
                                                    <span className="font-mono-sm text-mono-sm text-on-surface-variant">4 hours ago</span>
                                                </div>
                                                <p className="font-body-md text-body-md text-on-surface-variant mt-1">The logistics summary for October 24th has been generated. 124 units moved today.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            notifData?.data.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`relative bg-white border border-outline-variant rounded-xl p-5 shadow-sm flex items-start gap-4 transition-colors hover:bg-surface-container-low/30 ${
                                        !notif.read_at ? 'bg-primary-container/5' : 'opacity-85'
                                    }`}
                                >
                                    {!notif.read_at && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
                                    )}
                                    <div className={`p-2 rounded-lg flex items-center justify-center ${
                                        !notif.read_at ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant'
                                    }`}>
                                        <span className="material-symbols-outlined">notifications</span>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-on-surface text-base">
                                                {notif.data.title || 'Clinical Blood Alert'}
                                            </h4>
                                            <span className="text-xs text-on-surface-variant font-mono-sm">
                                                {new Date(notif.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-on-surface-variant">{notif.data.message}</p>
                                        {!notif.read_at && (
                                            <button
                                                onClick={() => handleMarkAsRead(notif.id)}
                                                className="text-xs font-bold text-secondary hover:underline pt-2 block"
                                            >
                                                Mark as Read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
};

export default Notifications;
