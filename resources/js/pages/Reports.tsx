import React, { useState } from 'react';
import { SidebarLayout } from '../components/SidebarLayout.tsx';

interface ReportMetric {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
}

const Reports: React.FC = () => {
    const [dateRange, setDateRange] = useState('This Month');
    const [exportStatus, setExportStatus] = useState<string | null>(null);

    const metrics: ReportMetric[] = [
        { label: 'Donation Fulfillment Rate', value: '94.2%', change: '+2.4% from last month', trend: 'up' },
        { label: 'Emergency Request Frequency', value: '14.8 cases / week', change: '-5.1% improvement', trend: 'down' },
        { label: 'Average Response Time', value: '18 mins', change: '-4 mins acceleration', trend: 'down' },
        { label: 'Total Blood Pints Collected', value: '1,248 Pints', change: '+12.5% harvest increase', trend: 'up' },
    ];

    const monthlyTrends = [
        { month: 'Jan', donations: 120, requests: 110, fulfillment: '91%' },
        { month: 'Feb', donations: 140, requests: 135, fulfillment: '96%' },
        { month: 'Mar', donations: 160, requests: 155, fulfillment: '96%' },
        { month: 'Apr', donations: 110, requests: 105, fulfillment: '95%' },
        { month: 'May', donations: 180, requests: 170, fulfillment: '94%' },
        { month: 'Jun', donations: 210, requests: 195, fulfillment: '92%' },
    ];

    const handleExport = (format: 'PDF' | 'CSV') => {
        setExportStatus(`Compiling clinical analytics... Exporting ${format} successfully!`);
        setTimeout(() => setExportStatus(null), 3000);
    };

    return (
        <SidebarLayout>
            <div className="px-6 pt-24 pb-8 space-y-8 text-left">
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Clinical Analytics & Reporting</h2>
                        <p className="text-sm text-on-surface-variant">Logistics tracking, patient fulfillment rates, and emergency response statistics.</p>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:border-primary font-semibold"
                        >
                            <option value="This Month">This Month</option>
                            <option value="Last 3 Months">Last 3 Months</option>
                            <option value="Year 2026">Year 2026</option>
                        </select>
                        <button
                            onClick={() => handleExport('PDF')}
                            className="bg-primary text-white text-sm font-semibold h-10 px-4 rounded-lg flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                            Export PDF
                        </button>
                        <button
                            onClick={() => handleExport('CSV')}
                            className="bg-surface-container-high border border-outline-variant text-on-surface text-sm font-semibold h-10 px-4 rounded-lg flex items-center gap-1.5 active:scale-95 transition-all hover:bg-surface-container-highest"
                        >
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            Export CSV
                        </button>
                    </div>
                </div>

                {exportStatus && (
                    <div className="bg-primary-container/20 text-primary border border-primary/20 p-4 rounded-xl flex items-center gap-2 animate-fade-in font-semibold text-sm">
                        <span className="material-symbols-outlined text-primary animate-spin">progress_activity</span>
                        {exportStatus}
                    </div>
                )}

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metrics.map((m, idx) => (
                        <div key={idx} className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
                            <span className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">{m.label}</span>
                            <div className="flex items-baseline gap-2 mt-2">
                                <span className="text-2xl font-bold text-on-surface">{m.value}</span>
                            </div>
                            <span className={`text-xs font-semibold block mt-1 ${
                                m.trend === 'up' ? 'text-green-600' : 'text-primary'
                            }`}>
                                {m.change}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Table Analytics & Fulfillment Rates */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden lg:col-span-2">
                        <div className="p-5 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                            <h3 className="font-bold text-on-surface text-sm">Monthly Logistics Trend (2026)</h3>
                            <span className="text-xs text-on-surface-variant font-medium">Synced with warehouse storage logs</span>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {monthlyTrends.map((t, idx) => (
                                    <div key={idx} className="flex items-center justify-between border-b border-outline-low pb-3 last:border-0 last:pb-0">
                                        <div className="w-16 font-semibold text-on-surface-variant">{t.month}</div>
                                        <div className="flex-1 px-4">
                                            <div className="h-2 bg-surface-container-low rounded-full overflow-hidden flex">
                                                <div className="bg-primary h-full rounded-full" style={{ width: `${(t.requests / 220) * 100}%` }}></div>
                                                <div className="bg-green-500 h-full rounded-full" style={{ width: `${(t.donations / 220) * 100}%` }}></div>
                                            </div>
                                        </div>
                                        <div className="text-right text-xs font-medium space-x-4">
                                            <span>Donations: <strong className="text-green-700 font-bold">{t.donations}</strong></span>
                                            <span>Requests: <strong className="text-primary font-bold">{t.requests}</strong></span>
                                            <span className="bg-surface-container px-2 py-0.5 rounded text-[11px] font-bold text-on-surface-variant">Fulfill: {t.fulfillment}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-on-surface text-sm mb-4">Emergency Request Frequency</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-semibold mb-1 text-on-surface-variant">
                                        <span>Trauma Level 1</span>
                                        <span className="text-primary font-bold">42%</span>
                                    </div>
                                    <div className="h-2 bg-surface-container-low rounded-full overflow-hidden">
                                        <div className="bg-primary h-full" style={{ width: '42%' }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-semibold mb-1 text-on-surface-variant">
                                        <span>Obstetric Emergencies</span>
                                        <span className="text-orange-500 font-bold">28%</span>
                                    </div>
                                    <div className="h-2 bg-surface-container-low rounded-full overflow-hidden">
                                        <div className="bg-orange-500 h-full" style={{ width: '28%' }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-semibold mb-1 text-on-surface-variant">
                                        <span>Surgical Procedures</span>
                                        <span className="text-blue-500 font-bold">18%</span>
                                    </div>
                                    <div className="h-2 bg-surface-container-low rounded-full overflow-hidden">
                                        <div className="bg-blue-500 h-full" style={{ width: '18%' }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-semibold mb-1 text-on-surface-variant">
                                        <span>Anemia Treatments</span>
                                        <span className="text-green-500 font-bold">12%</span>
                                    </div>
                                    <div className="h-2 bg-surface-container-low rounded-full overflow-hidden">
                                        <div className="bg-green-500 h-full" style={{ width: '12%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-outline-variant text-center">
                            <p className="text-[11px] text-on-surface-variant leading-relaxed">
                                Trauma level 1 remains the leading driver for emergency O- negative blood matching requests.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
};

export default Reports;
