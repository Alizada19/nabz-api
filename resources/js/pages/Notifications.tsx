import React, { useState } from 'react';
import { SidebarLayout } from '../components/SidebarLayout.tsx';

interface ClinicalNotification {
    id: number;
    severity: 'Emergency' | 'Warning' | 'Info';
    category: 'Emergency Alerts' | 'Donor Requests' | 'System Logs';
    title: string;
    message: string;
    targetRecipient: string;
    timestamp: string;
    read: boolean;
}

const initialNotifications: ClinicalNotification[] = [
    {
        id: 1,
        severity: 'Emergency',
        category: 'Emergency Alerts',
        title: 'Critical Supply Shortage: O- Negative',
        message: 'St. Jude\'s Medical Center reported zero units of O- blood. Immediate dispatch required from regional warehouse.',
        targetRecipient: 'All Nearby O- Donors',
        timestamp: '12 mins ago',
        read: false,
    },
    {
        id: 2,
        severity: 'Warning',
        category: 'Donor Requests',
        title: 'Donor Matching Verification Pending',
        message: 'James Wilson (Type A+) recently registered. Clinical background verification and donor profile are currently pending approval.',
        targetRecipient: 'Clinic System Admin',
        timestamp: '1 hour ago',
        read: false,
    },
    {
        id: 3,
        severity: 'Info',
        category: 'System Logs',
        title: 'Cold Storage Log Sync Successful',
        message: 'Automated database synchronization of all cold storage temperatures (avg 4.1°C) completed without anomalies.',
        targetRecipient: 'System Integrity Logs',
        timestamp: '4 hours ago',
        read: true,
    },
    {
        id: 4,
        severity: 'Emergency',
        category: 'Emergency Alerts',
        title: 'Urgent Patient Case Match Found',
        message: 'Patient in trauma ICU requires 4 units of B- blood. Matching notifications dispatched to 14 eligible donors.',
        targetRecipient: 'Eligible B- Donors',
        timestamp: '6 hours ago',
        read: false,
    },
    {
        id: 5,
        severity: 'Info',
        category: 'System Logs',
        title: 'Daily Logistics Summary Ready',
        message: 'October 24th inventory movement sheet generated: 124 pints successfully dispatched globally.',
        targetRecipient: 'Hospital Administration Board',
        timestamp: '1 day ago',
        read: true,
    }
];

const Notifications: React.FC = () => {
    const [notifs, setNotifs] = useState<ClinicalNotification[]>(initialNotifications);
    const [activeTab, setActiveTab] = useState<'All' | 'Emergency Alerts' | 'Donor Requests' | 'System Logs'>('All');

    // Broadcast modal state
    const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [broadcastMethod, setBroadcastMethod] = useState('SMS & WhatsApp');
    const [broadcastGroup, setBroadcastGroup] = useState('O- Negative Donors');

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const handleMarkAsRead = (id: number) => {
        setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleDismiss = (id: number) => {
        setNotifs(prev => prev.filter(n => n.id !== id));
    };

    const handleMarkAllAsRead = () => {
        setNotifs(prev => prev.map(n => ({ ...n, read: true })));
        setToastMessage('All notifications marked as read.');
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleSendBroadcast = (e: React.FormEvent) => {
        e.preventDefault();

        // Add new broadcast alert to current notifications list
        const newAlert: ClinicalNotification = {
            id: Date.now(),
            severity: 'Emergency',
            category: 'Emergency Alerts',
            title: broadcastTitle || 'Emergency System Broadcast',
            message: broadcastMsg,
            targetRecipient: broadcastGroup,
            timestamp: 'Just now',
            read: false,
        };

        setNotifs(prev => [newAlert, ...prev]);
        setIsBroadcastOpen(false);
        setBroadcastTitle('');
        setBroadcastMsg('');

        setToastMessage(`Mass Broadcast successfully dispatched to ${broadcastGroup} via ${broadcastMethod}!`);
        setTimeout(() => setToastMessage(null), 5000);
    };

    // Filters
    const filteredNotifs = notifs.filter(n => {
        if (activeTab === 'All') return true;
        return n.category === activeTab;
    });

    const unreadCount = notifs.filter(n => !n.read).length;

    return (
        <SidebarLayout>
            <div className="px-6 pt-24 pb-8 space-y-8 text-left">
                {/* Header Block */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface flex items-center gap-2">
                            Clinical Alerts & Dispatch Center
                            {unreadCount > 0 && (
                                <span className="bg-primary text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                                    {unreadCount} Unread
                                </span>
                            )}
                        </h2>
                        <p className="text-sm text-on-surface-variant">Real-time trauma hospital matching requests and system synchronization monitoring.</p>
                    </div>
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="h-10 px-4 rounded-lg border border-outline hover:bg-surface-container-low text-xs font-bold text-on-surface"
                            >
                                Mark All as Read
                            </button>
                        )}
                        <button
                            onClick={() => setIsBroadcastOpen(true)}
                            className="bg-primary text-white font-semibold h-10 px-5 rounded-lg active:scale-95 transition-transform flex items-center gap-2 shadow-sm hover:opacity-95"
                        >
                            <span className="material-symbols-outlined text-[18px]">campaign</span>
                            Send Broadcast Notification
                        </button>
                    </div>
                </div>

                {/* Toasts */}
                {toastMessage && (
                    <div className="bg-green-100 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-2 animate-fade-in font-semibold text-sm">
                        <span className="material-symbols-outlined text-green-600">check_circle</span>
                        {toastMessage}
                    </div>
                )}

                {/* Categories Tabs Row */}
                <div className="flex border-b border-outline-variant gap-6 overflow-x-auto pb-0.5">
                    {(['All', 'Emergency Alerts', 'Donor Requests', 'System Logs'] as const).map(tab => {
                        const count = tab === 'All' ? notifs.length : notifs.filter(n => n.category === tab).length;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 font-semibold text-sm relative transition-all whitespace-nowrap ${
                                    activeTab === tab ? 'text-primary font-bold border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'
                                }`}
                            >
                                {tab}
                                <span className="ml-1.5 bg-surface-container px-2 py-0.5 rounded-full text-xs text-on-surface-variant font-medium">
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Notification Feed cards */}
                <div className="space-y-4">
                    {filteredNotifs.length === 0 ? (
                        <div className="p-16 text-center bg-white rounded-2xl border border-outline-variant text-on-surface-variant font-medium">
                            No active notifications match the selected filter.
                        </div>
                    ) : (
                        filteredNotifs.map((notif) => (
                            <div
                                key={notif.id}
                                className={`relative bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start overflow-hidden transition-all hover:shadow-md ${
                                    !notif.read ? 'bg-primary-container/5 border-primary/20' : 'opacity-75'
                                }`}
                            >
                                {/* Left strip indicator */}
                                <div className={`absolute left-0 top-0 h-full w-1.5 ${
                                    notif.severity === 'Emergency' ? 'bg-primary' :
                                    notif.severity === 'Warning' ? 'bg-yellow-500' : 'bg-blue-500'
                                }`}></div>

                                {/* Icon Block */}
                                <div className={`flex-shrink-0 p-3 rounded-xl ${
                                    notif.severity === 'Emergency' ? 'bg-red-50 text-red-700' :
                                    notif.severity === 'Warning' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'
                                }`}>
                                    <span className="material-symbols-outlined text-3xl">
                                        {notif.severity === 'Emergency' ? 'priority_high' :
                                         notif.severity === 'Warning' ? 'warning' : 'info'}
                                    </span>
                                </div>

                                {/* Info block */}
                                <div className="flex-grow space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-bold text-on-surface text-base leading-snug">{notif.title}</h3>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                                                notif.severity === 'Emergency' ? 'bg-red-100 text-red-800' :
                                                notif.severity === 'Warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {notif.severity}
                                            </span>
                                        </div>
                                        <span className="text-xs font-mono-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded self-start sm:self-center">
                                            {notif.timestamp}
                                        </span>
                                    </div>

                                    <p className="text-sm text-on-surface-variant leading-relaxed">{notif.message}</p>

                                    <div className="flex items-center gap-4 text-xs font-semibold text-on-surface-variant pt-2">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]">groups</span>
                                            Target: <strong className="text-on-surface font-bold">{notif.targetRecipient}</strong>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]">grid_view</span>
                                            Category: <strong className="text-on-surface font-bold">{notif.category}</strong>
                                        </span>
                                    </div>
                                </div>

                                {/* Right actions buttons */}
                                <div className="flex sm:flex-col gap-2 w-full md:w-auto md:self-stretch justify-end md:justify-center items-end border-t border-outline-variant pt-4 md:border-t-0 md:pt-0">
                                    {!notif.read && (
                                        <button
                                            onClick={() => handleMarkAsRead(notif.id)}
                                            className="h-9 px-4 rounded-lg bg-primary text-white text-xs font-bold active:scale-95 transition-all w-full md:w-28 text-center"
                                        >
                                            Mark as Read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDismiss(notif.id)}
                                        className="h-9 px-4 rounded-lg border border-outline hover:bg-surface-container-low text-xs font-bold text-on-surface-variant active:scale-95 transition-all w-full md:w-28 text-center"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Send Broadcast Modal */}
                {isBroadcastOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-outline-variant">
                            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                                <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">campaign</span>
                                    Mass Match Alert Broadcast
                                </h3>
                                <button onClick={() => setIsBroadcastOpen(false)} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleSendBroadcast} className="p-6 space-y-4 text-left">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Broadcast Headline</label>
                                    <input
                                        type="text"
                                        required
                                        value={broadcastTitle}
                                        onChange={(e) => setBroadcastTitle(e.target.value)}
                                        className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-primary text-sm font-medium"
                                        placeholder="Critical Blood Shortage: Immediate O- Donors Needed"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Outreach Channels</label>
                                        <select
                                            value={broadcastMethod}
                                            onChange={(e) => setBroadcastMethod(e.target.value)}
                                            className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-primary text-sm font-semibold text-on-surface-variant"
                                        >
                                            <option value="SMS & WhatsApp">SMS & WhatsApp</option>
                                            <option value="In-App Push Only">In-App Push Only</option>
                                            <option value="All Telephony Gateways">All Telephony Gateways</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Recipient Segment</label>
                                        <select
                                            value={broadcastGroup}
                                            onChange={(e) => setBroadcastGroup(e.target.value)}
                                            className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-primary text-sm font-semibold text-on-surface-variant"
                                        >
                                            <option value="O- Negative Donors">O- Negative Donors</option>
                                            <option value="All Rare Blood Groups">All Rare Blood Groups</option>
                                            <option value="All Registered Donors">All Registered Donors</option>
                                            <option value="Local Hospital Coordinators">Local Hospital Coordinators</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Outreach Message Body</label>
                                    <textarea
                                        required
                                        value={broadcastMsg}
                                        onChange={(e) => setBroadcastMsg(e.target.value)}
                                        placeholder="Hospital has reported a zero-stock event of O- blood. If you are eligible and within 25km, please report to National Clinical Center immediately."
                                        className="w-full h-24 p-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-primary text-sm leading-relaxed"
                                    />
                                </div>

                                <div className="pt-4 border-t border-outline-variant flex justify-end gap-3 bg-surface-container-lowest">
                                    <button
                                        type="button" onClick={() => setIsBroadcastOpen(false)}
                                        className="h-10 px-4 rounded-lg border border-outline hover:bg-surface-container-low text-sm font-semibold text-on-surface-variant"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="h-10 px-6 rounded-lg bg-primary text-white text-sm font-semibold active:scale-95 transition-transform"
                                    >
                                        Transmit Broadcast
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
};

export default Notifications;
