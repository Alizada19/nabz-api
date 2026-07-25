import React, { useState } from 'react';
import { SidebarLayout } from '../components/SidebarLayout.tsx';

const Settings: React.FC = () => {
    // System Alert States
    const [smsAlerts, setSmsAlerts] = useState(true);
    const [whatsAppAlerts, setWhatsAppAlerts] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(false);

    // Match limits
    const [matchRadius, setMatchRadius] = useState(25);
    const [minDonationInterval, setMinDonationInterval] = useState(90); // days

    // Hospital Metadata
    const [hospitalPhone, setHospitalPhone] = useState('+603-9998-1244');
    const [hospitalEmail, setHospitalEmail] = useState('support@hemoglobin.org');
    const [clinicAddress, setClinicAddress] = useState('National Clinical Center, Kuala Lumpur, Malaysia');

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const handleSaveConfig = (e: React.FormEvent) => {
        e.preventDefault();
        setToastMessage('System configurations saved successfully and propagated to matching service!');
        setTimeout(() => setToastMessage(null), 4000);
    };

    return (
        <SidebarLayout>
            <div className="px-6 pt-24 pb-8 max-w-4xl space-y-8 text-left">
                {/* Header */}
                <div>
                    <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">System Configurations & Alerts</h2>
                    <p className="text-sm text-on-surface-variant">Configure hospital details, SMS dispatch integrations, and matching service distance thresholds.</p>
                </div>

                {toastMessage && (
                    <div className="bg-green-100 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3 animate-fade-in font-semibold text-sm">
                        <span className="material-symbols-outlined text-green-600">verified</span>
                        {toastMessage}
                    </div>
                )}

                <form onSubmit={handleSaveConfig} className="space-y-6">
                    {/* Matching Algorithms Panel */}
                    <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm space-y-6">
                        <h3 className="font-bold text-primary font-headline-md text-headline-md flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">psychology</span>
                            Automated Matching Thresholds
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Donor Searching Radius</label>
                                    <span className="text-sm font-bold text-primary">{matchRadius} km</span>
                                </div>
                                <input
                                    type="range"
                                    min="5"
                                    max="150"
                                    value={matchRadius}
                                    onChange={(e) => setMatchRadius(parseInt(e.target.value))}
                                    className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <span className="text-[11px] text-on-surface-variant block">Optimal radius for immediate trauma dispatch matches is 25km.</span>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Min. Donation Buffer (Days)</label>
                                <input
                                    type="number"
                                    min="30"
                                    max="180"
                                    value={minDonationInterval}
                                    onChange={(e) => setMinDonationInterval(parseInt(e.target.value) || 90)}
                                    className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-primary text-sm font-medium"
                                />
                                <span className="text-[11px] text-on-surface-variant block">Standard clinical policy mandates 90 days between donations.</span>
                            </div>
                        </div>
                    </div>

                    {/* Notification Dispatch Integration */}
                    <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4">
                        <h3 className="font-bold text-primary font-headline-md text-headline-md flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">sms</span>
                            Emergency Dispatches & SMS Gateways
                        </h3>

                        <div className="divide-y divide-outline-variant">
                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <h4 className="font-bold text-on-surface text-sm">Emergency SMS Alerts</h4>
                                    <p className="text-xs text-on-surface-variant">Send automated SMS notifications to compatible local donors when a critical request is initiated.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={smsAlerts}
                                    onChange={(e) => setSmsAlerts(e.target.checked)}
                                    className="w-10 h-6 bg-surface-container rounded-full appearance-none checked:bg-primary transition-colors cursor-pointer relative before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:translate-x-4 before:transition-transform border border-outline-variant"
                                />
                            </div>

                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <h4 className="font-bold text-on-surface text-sm">WhatsApp Match Broadcast</h4>
                                    <p className="text-xs text-on-surface-variant">Automated WhatsApp outreach via the official Twilio hospital gateway.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={whatsAppAlerts}
                                    onChange={(e) => setWhatsAppAlerts(e.target.checked)}
                                    className="w-10 h-6 bg-surface-container rounded-full appearance-none checked:bg-primary transition-colors cursor-pointer relative before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:translate-x-4 before:transition-transform border border-outline-variant"
                                />
                            </div>

                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <h4 className="font-bold text-on-surface text-sm">Weekly Summary Emails</h4>
                                    <p className="text-xs text-on-surface-variant">Dispatch weekly clinical analytics reports to hospital coordinators.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={emailAlerts}
                                    onChange={(e) => setEmailAlerts(e.target.checked)}
                                    className="w-10 h-6 bg-surface-container rounded-full appearance-none checked:bg-primary transition-colors cursor-pointer relative before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:translate-x-4 before:transition-transform border border-outline-variant"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Hospital Contact Info */}
                    <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4">
                        <h3 className="font-bold text-primary font-headline-md text-headline-md flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">local_hospital</span>
                            National Center Profile Settings
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Hospital Contact Phone</label>
                                <input
                                    type="text"
                                    value={hospitalPhone}
                                    onChange={(e) => setHospitalPhone(e.target.value)}
                                    className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-primary text-sm font-medium"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Official Medical Email</label>
                                <input
                                    type="email"
                                    value={hospitalEmail}
                                    onChange={(e) => setHospitalEmail(e.target.value)}
                                    className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-primary text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Clinic Physical Address</label>
                            <input
                                type="text"
                                value={clinicAddress}
                                onChange={(e) => setClinicAddress(e.target.value)}
                                className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-primary text-sm font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-primary text-white font-semibold h-11 px-8 rounded-lg active:scale-95 transition-transform shadow-sm hover:opacity-95"
                        >
                            Save System Configuration
                        </button>
                    </div>
                </form>
            </div>
        </SidebarLayout>
    );
};

export default Settings;
