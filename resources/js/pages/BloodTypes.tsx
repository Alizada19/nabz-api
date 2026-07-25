import React, { useState } from 'react';
import { SidebarLayout } from '../components/SidebarLayout.tsx';

interface BloodStockItem {
    id: number;
    name: string;
    units: number;
    threshold: number;
    status: 'Optimal' | 'Low Stock' | 'Critical Shortage';
    lastUpdated: string;
    tempCelsius: number;
}

const initialStock: BloodStockItem[] = [
    { id: 1, name: 'O-', units: 14, threshold: 15, status: 'Low Stock', lastUpdated: '10 mins ago', tempCelsius: 4.2 },
    { id: 2, name: 'O+', units: 48, threshold: 20, status: 'Optimal', lastUpdated: '2 hours ago', tempCelsius: 3.8 },
    { id: 3, name: 'A-', units: 8, threshold: 10, status: 'Low Stock', lastUpdated: '1 hour ago', tempCelsius: 4.1 },
    { id: 4, name: 'A+', units: 55, threshold: 20, status: 'Optimal', lastUpdated: '3 hours ago', tempCelsius: 4.0 },
    { id: 5, name: 'B-', units: 3, threshold: 8, status: 'Critical Shortage', lastUpdated: '5 mins ago', tempCelsius: 3.9 },
    { id: 6, name: 'B+', units: 34, threshold: 15, status: 'Optimal', lastUpdated: '12 hours ago', tempCelsius: 4.3 },
    { id: 7, name: 'AB-', units: 6, threshold: 5, status: 'Optimal', lastUpdated: '1 day ago', tempCelsius: 4.1 },
    { id: 8, name: 'AB+', units: 27, threshold: 10, status: 'Optimal', lastUpdated: '6 hours ago', tempCelsius: 4.2 },
];

const BloodTypes: React.FC = () => {
    const [stocks, setStocks] = useState<BloodStockItem[]>(initialStock);
    const [isAdjustOpen, setIsAdjustOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<string>('O-');
    const [actionType, setActionType] = useState<'add' | 'subtract'>('add');
    const [unitsInput, setUnitsInput] = useState<number>(5);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const handleAdjustInventory = (e: React.FormEvent) => {
        e.preventDefault();
        setStocks(prev => prev.map(item => {
            if (item.name === selectedType) {
                const modifier = actionType === 'add' ? unitsInput : -unitsInput;
                const newUnits = Math.max(0, item.units + modifier);

                // Determine new status based on thresholds
                let newStatus: 'Optimal' | 'Low Stock' | 'Critical Shortage' = 'Optimal';
                if (newUnits <= item.threshold / 2) {
                    newStatus = 'Critical Shortage';
                } else if (newUnits <= item.threshold) {
                    newStatus = 'Low Stock';
                }

                return {
                    ...item,
                    units: newUnits,
                    status: newStatus,
                    lastUpdated: 'Just now'
                };
            }
            return item;
        }));

        setToastMessage(`Successfully adjusted ${selectedType} stock levels!`);
        setIsAdjustOpen(false);
        setTimeout(() => setToastMessage(null), 4000);
    };

    const triggerQuickRestock = (typeName: string) => {
        setSelectedType(typeName);
        setActionType('add');
        setUnitsInput(10);
        setIsAdjustOpen(true);
    };

    const totalUnits = stocks.reduce((acc, curr) => acc + curr.units, 0);
    const lowStockCount = stocks.filter(s => s.status !== 'Optimal').length;

    return (
        <SidebarLayout>
            <div className="px-6 pt-24 pb-8 space-y-8 text-left">
                {/* Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Blood Inventory & Cold Storage</h2>
                        <p className="text-sm text-on-surface-variant">Real-time status of clinical blood banking units and automated temperature thresholds.</p>
                    </div>
                    <button
                        onClick={() => setIsAdjustOpen(true)}
                        className="bg-primary text-white font-semibold h-11 px-6 rounded-lg active:scale-95 transition-all flex items-center gap-2 shadow-sm hover:opacity-95"
                    >
                        <span className="material-symbols-outlined text-[20px]">tune</span>
                        Adjust Stock Level
                    </button>
                </div>

                {/* Toast Notification */}
                {toastMessage && (
                    <div className="bg-green-100 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
                        <span className="material-symbols-outlined text-green-600">check_circle</span>
                        <span className="text-sm font-semibold">{toastMessage}</span>
                    </div>
                )}

                {/* High-Level Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
                            <span className="material-symbols-outlined text-3xl">bloodtype</span>
                        </div>
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">Total Banked Units</span>
                            <span className="text-3xl font-bold text-on-surface block mt-1">{totalUnits} Units</span>
                            <span className="text-xs text-green-600 font-semibold block mt-1">Within optimal shelf lifetime</span>
                        </div>
                    </div>

                    <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center border border-yellow-100">
                            <span className="material-symbols-outlined text-3xl">warning</span>
                        </div>
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">Alert Levels</span>
                            <span className="text-3xl font-bold text-on-surface block mt-1">{lowStockCount} Groups</span>
                            <span className="text-xs text-on-surface-variant block mt-1">Require urgent donor match dispatches</span>
                        </div>
                    </div>

                    <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                            <span className="material-symbols-outlined text-3xl">thermostat</span>
                        </div>
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">Avg Cold Temp</span>
                            <span className="text-3xl font-bold text-on-surface block mt-1">4.1 °C</span>
                            <span className="text-xs text-green-600 font-semibold block mt-1">Safe range (2°C - 6°C) guaranteed</span>
                        </div>
                    </div>
                </div>

                {/* Stock Inventory Table */}
                <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                        <h3 className="font-bold text-on-surface text-base">Blood Bank Inventory Status</h3>
                        <span className="text-xs bg-outline-variant text-on-surface px-2 py-1 rounded font-mono-sm">REF-STOCK-v4.2</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-outline-variant bg-surface-container-lowest text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                                    <th className="p-4">Blood Group</th>
                                    <th className="p-4">Available Units (Pints)</th>
                                    <th className="p-4">Cold Storage Temp</th>
                                    <th className="p-4">Min. Threshold</th>
                                    <th className="p-4">Stock Status</th>
                                    <th className="p-4">Last Logged Sync</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant text-sm text-on-surface">
                                {stocks.map((item) => (
                                    <tr key={item.id} className="hover:bg-surface-container-low/30 transition-colors">
                                        <td className="p-4 font-bold text-lg text-primary flex items-center gap-2">
                                            <span className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-sm border border-red-100">
                                                {item.name}
                                            </span>
                                        </td>
                                        <td className="p-4 font-semibold text-base">{item.units} Pints</td>
                                        <td className="p-4 font-mono-sm text-xs text-on-surface-variant">{item.tempCelsius} °C</td>
                                        <td className="p-4 text-xs text-on-surface-variant font-medium">{item.threshold} Units</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                item.status === 'Optimal' ? 'bg-green-100 text-green-800' :
                                                item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    item.status === 'Optimal' ? 'bg-green-600' :
                                                    item.status === 'Low Stock' ? 'bg-yellow-600' :
                                                    'bg-red-600'
                                                }`}></span>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs text-on-surface-variant">{item.lastUpdated}</td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => triggerQuickRestock(item.name)}
                                                className="h-8 px-3 rounded-lg border border-outline hover:bg-surface-container-low text-xs font-bold text-on-surface-variant flex items-center gap-1 inline-flex ml-auto"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">add</span>
                                                Quick Restock
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Adjust Stock Level Modal */}
                {isAdjustOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-outline-variant">
                            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Adjust Inventory</h3>
                                <button onClick={() => setIsAdjustOpen(false)} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleAdjustInventory} className="p-6 space-y-4 text-left">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Select Blood Group</label>
                                    <select
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-primary text-sm font-semibold"
                                    >
                                        {stocks.map(item => (
                                            <option key={item.id} value={item.name}>{item.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Adjustment Action</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setActionType('add')}
                                            className={`h-11 rounded-lg font-bold border flex items-center justify-center gap-2 ${
                                                actionType === 'add' ? 'bg-green-50 border-green-300 text-green-700' : 'border-outline text-on-surface-variant hover:bg-surface-container-low'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined">add</span>
                                            Restock / Add
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActionType('subtract')}
                                            className={`h-11 rounded-lg font-bold border flex items-center justify-center gap-2 ${
                                                actionType === 'subtract' ? 'bg-red-50 border-red-300 text-red-700' : 'border-outline text-on-surface-variant hover:bg-surface-container-low'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined">remove</span>
                                            Fulfill / Subtract
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Amount of Units (Pints)</label>
                                    <input
                                        type="number"
                                        required
                                        value={unitsInput}
                                        onChange={(e) => setUnitsInput(parseInt(e.target.value) || 0)}
                                        className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-primary text-sm"
                                        min="1"
                                    />
                                </div>

                                <div className="pt-4 border-t border-outline-variant flex justify-end gap-3 bg-surface-container-lowest">
                                    <button
                                        type="button" onClick={() => setIsAdjustOpen(false)}
                                        className="h-10 px-4 rounded-lg border border-outline hover:bg-surface-container-low text-sm font-semibold text-on-surface-variant"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="h-10 px-6 rounded-lg bg-primary text-white text-sm font-semibold active:scale-95 transition-transform"
                                    >
                                        Apply Adjustment
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

export default BloodTypes;
