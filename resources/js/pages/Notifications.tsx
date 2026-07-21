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
            <div className="px-6 pt-8 pb-8 space-y-6">
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
                    <div className="bg-white border border-outline-variant rounded-2xl shadow-sm divide-y divide-outline-variant overflow-hidden">
                        {notifData?.data.length === 0 ? (
                            <div className="p-12 text-center text-on-surface-variant text-sm">
                                You don't have any active system or clinical notifications yet.
                            </div>
                        ) : (
                            notifData?.data.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`p-5 flex items-start gap-4 transition-colors hover:bg-surface-container-low/30 relative ${
                                        !notif.read_at ? 'bg-primary-container/5' : ''
                                    }`}
                                >
                                    {!notif.read_at && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                                    )}
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <span className="material-symbols-outlined text-xl">notifications</span>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold text-on-surface text-sm">
                                                {notif.data.title || 'Clinical Blood Alert'}
                                            </h4>
                                            <span className="text-xs text-on-surface-variant">
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
