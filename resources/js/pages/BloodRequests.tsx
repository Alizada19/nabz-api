import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client.ts';
import { SidebarLayout } from '../components/SidebarLayout.tsx';

interface BloodRequest {
    id: number;
    seeker_id: number;
    blood_type: {
        id: number;
        name: string;
    };
    hospital_name: string;
    hospital_address: string;
    latitude: number;
    longitude: number;
    units_required: number;
    urgency_level: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'approved' | 'completed' | 'cancelled';
    notes: string | null;
    created_at: string;
}

interface PaginatedBloodRequests {
    success: boolean;
    data: BloodRequest[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const BloodRequests: React.FC = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [bloodTypeFilter, setBloodTypeFilter] = useState('');
    const [urgencyFilter, setUrgencyFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Form inputs state
    const [hospitalName, setHospitalName] = useState('');
    const [hospitalAddress, setHospitalAddress] = useState('');
    const [bloodTypeId, setBloodTypeId] = useState('1');
    const [unitsRequired, setUnitsRequired] = useState('1');
    const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
    const [notes, setNotes] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    // Fetch blood requests
    const { data: requestsData, isLoading, error } = useQuery<PaginatedBloodRequests>({
        queryKey: ['blood-requests', page, search, bloodTypeFilter, urgencyFilter, statusFilter],
        queryFn: async () => {
            const { data } = await apiClient.get('/blood-requests', {
                params: { page }
            });

            let filtered = data.data || [];

            // Apply search & filters locally
            if (search) {
                filtered = filtered.filter((r: any) =>
                    r.hospital_name.toLowerCase().includes(search.toLowerCase()) ||
                    r.hospital_address.toLowerCase().includes(search.toLowerCase())
                );
            }
            if (bloodTypeFilter) {
                filtered = filtered.filter((r: any) => r.blood_type?.id === parseInt(bloodTypeFilter));
            }
            if (urgencyFilter) {
                filtered = filtered.filter((r: any) => r.urgency_level === urgencyFilter);
            }
            if (statusFilter) {
                filtered = filtered.filter((r: any) => r.status === statusFilter);
            }

            return {
                success: true,
                data: filtered,
                meta: data.meta || { current_page: 1, last_page: 1, per_page: 15, total: filtered.length }
            };
        }
    });

    const createRequestMutation = useMutation({
        mutationFn: async (reqData: any) => {
            const { data } = await apiClient.post('/blood-requests', reqData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blood-requests'] });
            setIsAddOpen(false);
            resetForm();
        },
        onError: (err: any) => {
            setFormError(err.response?.data?.message || 'Error occurred while saving blood request.');
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: number; status: string }) => {
            const { data } = await apiClient.patch(`/blood-requests/${id}/status`, { status });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blood-requests'] });
        }
    });

    const resetForm = () => {
        setHospitalName('');
        setHospitalAddress('');
        setBloodTypeId('1');
        setUnitsRequired('1');
        setUrgencyLevel('medium');
        setNotes('');
        setFormError(null);
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        createRequestMutation.mutate({
            blood_type_id: parseInt(bloodTypeId),
            hospital_name: hospitalName,
            hospital_address: hospitalAddress,
            latitude: 3.1390,
            longitude: 101.6869,
            units_required: parseInt(unitsRequired),
            urgency_level: urgencyLevel,
            notes,
        });
    };

    const handleUpdateStatus = (id: number, status: string) => {
        updateStatusMutation.mutate({ id, status });
    };

    return (
        <SidebarLayout>
            <div className="px-6 pt-8 pb-8 space-y-8">
                {/* Search / Filter Section */}
                <section className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
                        <div className="flex-1 space-y-1.5">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Search Hospital / Medical Centers</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant">search</span>
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md"
                                    placeholder="Hospital name or address"
                                    type="text"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 lg:w-[480px]">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Blood Type</label>
                                <select
                                    value={bloodTypeFilter}
                                    onChange={(e) => setBloodTypeFilter(e.target.value)}
                                    className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none text-body-md"
                                >
                                    <option value="">All Types</option>
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
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Urgency</label>
                                <select
                                    value={urgencyFilter}
                                    onChange={(e) => setUrgencyFilter(e.target.value)}
                                    className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none text-body-md"
                                >
                                    <option value="">All</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none text-body-md"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={() => { resetForm(); setIsAddOpen(true); }}
                            className="bg-primary text-on-primary h-11 px-6 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Request Blood
                        </button>
                    </div>
                </section>

                {/* Blood Requests List */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-outline-variant shadow-sm">
                        <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
                        <p className="text-on-surface-variant mt-4 font-body-md">Retrieving clinical blood requests...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {requestsData?.data.length === 0 ? (
                            <div className="md:col-span-2 lg:col-span-3 p-12 text-center bg-white rounded-xl border border-outline-variant text-on-surface-variant">
                                No active blood requests registered.
                            </div>
                        ) : (
                            requestsData?.data.map((req) => (
                                <div
                                    key={req.id}
                                    className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow relative"
                                >
                                    <div className={`h-1.5 w-full ${
                                        req.urgency_level === 'critical' ? 'bg-primary' :
                                        req.urgency_level === 'high' ? 'bg-orange-500' :
                                        req.urgency_level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}></div>
                                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
                                                        {req.blood_type?.name}
                                                    </span>
                                                    <div>
                                                        <h4 className="font-bold text-on-surface text-base">{req.hospital_name}</h4>
                                                        <p className="text-xs text-on-surface-variant">{req.hospital_address}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-on-surface-variant font-medium mt-2">{req.units_required} units required</p>
                                            {req.notes && (
                                                <p className="text-xs text-on-surface-variant bg-surface-container-low p-2 rounded-lg mt-2 italic">
                                                    "{req.notes}"
                                                </p>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-outline-variant flex items-center justify-between">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                req.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                req.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                                req.status === 'cancelled' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {req.status.toUpperCase()}
                                            </span>

                                            {req.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleUpdateStatus(req.id, 'approved')}
                                                        className="h-8 px-3 rounded bg-secondary text-on-secondary text-xs font-bold hover:opacity-90 transition-opacity"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(req.id, 'cancelled')}
                                                        className="h-8 px-3 rounded bg-outline-variant/30 text-on-surface-variant text-xs font-bold hover:bg-outline-variant/50 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}

                                            {req.status === 'approved' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(req.id, 'completed')}
                                                    className="h-8 px-4 rounded bg-green-600 text-white text-xs font-bold hover:opacity-90 transition-opacity"
                                                >
                                                    Complete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Add Request Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-outline-variant">
                        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Initiate New Blood Request</h3>
                            <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface-variant">Hospital / Clinic Name</label>
                                    <input
                                        type="text" required value={hospitalName} onChange={(e) => setHospitalName(e.target.value)}
                                        className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-secondary text-sm"
                                        placeholder="City General Hospital"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface-variant">Hospital Address</label>
                                    <input
                                        type="text" required value={hospitalAddress} onChange={(e) => setHospitalAddress(e.target.value)}
                                        className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-secondary text-sm"
                                        placeholder="123 Hospital St, Kuala Lumpur"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface-variant">Blood Type Required</label>
                                    <select
                                        value={bloodTypeId} onChange={(e) => setBloodTypeId(e.target.value)}
                                        className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-secondary text-sm"
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
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface-variant">Units Required</label>
                                    <input
                                        type="number" required value={unitsRequired} onChange={(e) => setUnitsRequired(e.target.value)}
                                        className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-secondary text-sm"
                                        min="1" max="100"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface-variant">Urgency Level</label>
                                    <select
                                        value={urgencyLevel} onChange={(e) => setUrgencyLevel(e.target.value as any)}
                                        className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-secondary text-sm"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-on-surface-variant">Additional Notes / Clinical Context</label>
                                <textarea
                                    value={notes} onChange={(e) => setNotes(e.target.value)}
                                    className="w-full h-20 p-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-secondary text-sm"
                                    placeholder="Patient needs O- negative blood for open-heart clinical operation tomorrow."
                                />
                            </div>

                            {formError && (
                                <p className="text-xs text-error font-bold bg-error-container/20 p-3 rounded-lg border border-error/20">
                                    {formError}
                                </p>
                            )}

                            <div className="pt-4 border-t border-outline-variant flex justify-end gap-3 bg-surface-container-lowest">
                                <button
                                    type="button" onClick={() => setIsAddOpen(false)}
                                    className="h-10 px-4 rounded-lg border border-outline hover:bg-surface-container-low text-sm font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit" disabled={createRequestMutation.isPending}
                                    className="h-10 px-6 rounded-lg bg-primary text-on-primary text-sm font-semibold active:scale-95 transition-transform"
                                >
                                    {createRequestMutation.isPending ? 'Saving...' : 'Request Blood'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </SidebarLayout>
    );
};

export default BloodRequests;
