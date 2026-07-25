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
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);

    // Form inputs state
    const [hospitalName, setHospitalName] = useState('');
    const [hospitalAddress, setHospitalAddress] = useState('');
    const [bloodTypeId, setBloodTypeId] = useState('1');
    const [unitsRequired, setUnitsRequired] = useState('1');
    const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
    const [status, setStatus] = useState<'pending' | 'approved' | 'completed' | 'cancelled'>('pending');
    const [notes, setNotes] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    // Fetch blood requests
    const { data: requestsData, isLoading } = useQuery<PaginatedBloodRequests>({
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
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            setIsAddOpen(false);
            resetForm();
        },
        onError: (err: any) => {
            setFormError(err.response?.data?.message || 'Error occurred while saving blood request.');
        }
    });

    const updateRequestMutation = useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
            const { data } = await apiClient.put(`/blood-requests/${id}`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blood-requests'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            setIsEditOpen(false);
            resetForm();
        },
        onError: (err: any) => {
            setFormError(err.response?.data?.message || 'Error updating blood request.');
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: number; status: string }) => {
            const { data } = await apiClient.patch(`/blood-requests/${id}/status`, { status });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blood-requests'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
    });

    const deleteRequestMutation = useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.delete(`/blood-requests/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blood-requests'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to delete blood request.');
        }
    });

    const resetForm = () => {
        setHospitalName('');
        setHospitalAddress('');
        setBloodTypeId('1');
        setUnitsRequired('1');
        setUrgencyLevel('medium');
        setStatus('pending');
        setNotes('');
        setFormError(null);
        setSelectedRequest(null);
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

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest) return;
        setFormError(null);

        updateRequestMutation.mutate({
            id: selectedRequest.id,
            payload: {
                blood_type_id: parseInt(bloodTypeId),
                hospital_name: hospitalName,
                hospital_address: hospitalAddress,
                latitude: 3.1390,
                longitude: 101.6869,
                units_required: parseInt(unitsRequired),
                urgency_level: urgencyLevel,
                status,
                notes,
            }
        });
    };

    const triggerEdit = (req: BloodRequest) => {
        setSelectedRequest(req);
        setHospitalName(req.hospital_name);
        setHospitalAddress(req.hospital_address);
        setBloodTypeId(String(req.blood_type?.id || '1'));
        setUnitsRequired(String(req.units_required));
        setUrgencyLevel(req.urgency_level);
        setStatus(req.status);
        setNotes(req.notes || '');
        setFormError(null);
        setIsEditOpen(true);
    };

    const triggerDelete = (req: BloodRequest) => {
        if (confirm(`Are you sure you want to delete patient case REQ-2026-${req.id}?`)) {
            deleteRequestMutation.mutate(req.id);
        }
    };

    const handleUpdateStatus = (id: number, status: string) => {
        updateStatusMutation.mutate({ id, status });
    };

    return (
        <SidebarLayout>
            <div className="px-6 pt-24 pb-8 space-y-8">
                {/* Search & Filters Section */}
                <section className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
                        <div className="flex-1 space-y-1.5 text-left">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Search Hospital / Medical Centers</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant">search</span>
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md"
                                    placeholder="Search by hospital, ID or patient..."
                                    type="text"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 lg:w-[480px] text-left">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Blood Type</label>
                                <select
                                    value={bloodTypeFilter}
                                    onChange={(e) => setBloodTypeFilter(e.target.value)}
                                    className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none text-body-md focus:border-primary"
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
                                    className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none text-body-md focus:border-primary"
                                >
                                    <option value="">All Urgency</option>
                                    <option value="critical">Critical</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none text-body-md focus:border-primary"
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
                            <div className="md:col-span-2 lg:col-span-3 p-12 text-center bg-white rounded-xl border border-outline-variant text-on-surface-variant font-medium">
                                No active blood requests registered.
                            </div>
                        ) : (
                            requestsData?.data.map((req) => (
                                <div
                                    key={req.id}
                                    className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col hover:border-primary/30 hover:shadow-md transition-all text-left relative"
                                >
                                    <div className={`h-1.5 w-full ${
                                        req.urgency_level === 'critical' ? 'bg-primary' :
                                        req.urgency_level === 'high' ? 'bg-orange-500' :
                                        req.urgency_level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}></div>
                                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-primary-container text-on-primary-container flex items-center justify-center rounded-lg font-bold text-lg border border-primary/10">
                                                        {req.blood_type?.name}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-headline-md text-sm font-bold text-on-surface">Patient Case {req.id}</h3>
                                                        <p className="text-xs text-on-surface-variant">REQ-88219-{req.id}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                    req.urgency_level === 'critical' ? 'bg-red-100 text-red-700' :
                                                    req.urgency_level === 'high' ? 'bg-orange-100 text-orange-700' :
                                                    req.urgency_level === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                    {req.urgency_level.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="space-y-3 mb-6">
                                                <div className="flex items-start gap-2 text-on-surface-variant">
                                                    <span className="material-symbols-outlined text-sm mt-0.5">local_hospital</span>
                                                    <div>
                                                        <span className="text-xs font-semibold text-on-surface block">{req.hospital_name}</span>
                                                        <span className="text-[11px] text-on-surface-variant block">{req.hospital_address}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-on-surface-variant">
                                                    <span className="material-symbols-outlined text-sm">opacity</span>
                                                    <span className="text-xs font-medium">{req.units_required} Units Required</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-on-surface-variant">
                                                    <span className="material-symbols-outlined text-sm">info</span>
                                                    <span className="text-xs font-medium">Status: <span className="text-secondary font-bold">{req.status.toUpperCase()}</span></span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-outline-variant flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => { setSelectedRequest(req); setIsViewOpen(true); }}
                                                    className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-colors"
                                                    title="View Full Case"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                </button>
                                                <button
                                                    onClick={() => triggerEdit(req)}
                                                    className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-colors"
                                                    title="Edit Case"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => triggerDelete(req)}
                                                    className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg text-on-surface-variant transition-colors"
                                                    title="Delete Case"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>

                                            <div className="flex gap-1.5">
                                                {req.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(req.id, 'approved')}
                                                            className="py-1.5 px-3 rounded-lg bg-primary text-white font-label-md text-[11px] hover:bg-opacity-95 transition-all font-bold active:scale-95"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(req.id, 'cancelled')}
                                                            className="py-1.5 px-3 rounded-lg bg-surface-container-low text-on-surface font-label-md text-[11px] hover:bg-surface-container-high transition-colors font-bold"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}

                                                {req.status === 'approved' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(req.id, 'completed')}
                                                        className="py-1.5 px-3 rounded-lg bg-green-600 text-white font-label-md text-[11px] hover:bg-green-700 transition-colors font-bold active:scale-95"
                                                    >
                                                        Complete Case
                                                    </button>
                                                )}

                                                {req.status === 'completed' && (
                                                    <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">
                                                        COMPLETED
                                                    </span>
                                                )}

                                                {req.status === 'cancelled' && (
                                                    <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-1 rounded border border-red-200">
                                                        CANCELLED
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Request Blood Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-outline-variant">
                        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Initiate New Blood Request</h3>
                            <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-left">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">local_hospital</span>
                                        Hospital / Clinic Name
                                    </label>
                                    <input
                                        type="text" required value={hospitalName} onChange={(e) => setHospitalName(e.target.value)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                        placeholder="City General Hospital"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                                        Hospital Address
                                    </label>
                                    <input
                                        type="text" required value={hospitalAddress} onChange={(e) => setHospitalAddress(e.target.value)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                        placeholder="123 Hospital St, Kuala Lumpur"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">opacity</span>
                                        Blood Group
                                    </label>
                                    <select
                                        value={bloodTypeId} onChange={(e) => setBloodTypeId(e.target.value)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
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
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">history</span>
                                        Units Required
                                    </label>
                                    <input
                                        type="number" required value={unitsRequired} onChange={(e) => setUnitsRequired(e.target.value)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                        min="1" max="100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">warning</span>
                                        Urgency Level
                                    </label>
                                    <select
                                        value={urgencyLevel} onChange={(e) => setUrgencyLevel(e.target.value as any)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">info</span>
                                    Additional Notes / Context
                                </label>
                                <textarea
                                    value={notes} onChange={(e) => setNotes(e.target.value)}
                                    className="w-full h-20 p-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                    placeholder="Patient needs blood for open-heart clinical operation tomorrow."
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

            {/* Edit Request Modal */}
            {isEditOpen && selectedRequest && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-outline-variant">
                        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Edit Patient Case</h3>
                            <button onClick={() => setIsEditOpen(false)} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-left">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">local_hospital</span>
                                        Hospital / Clinic Name
                                    </label>
                                    <input
                                        type="text" required value={hospitalName} onChange={(e) => setHospitalName(e.target.value)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                                        Hospital Address
                                    </label>
                                    <input
                                        type="text" required value={hospitalAddress} onChange={(e) => setHospitalAddress(e.target.value)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">opacity</span>
                                        Blood Group
                                    </label>
                                    <select
                                        value={bloodTypeId} onChange={(e) => setBloodTypeId(e.target.value)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
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
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">history</span>
                                        Units Required
                                    </label>
                                    <input
                                        type="number" required value={unitsRequired} onChange={(e) => setUnitsRequired(e.target.value)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                        min="1" max="100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">warning</span>
                                        Urgency Level
                                    </label>
                                    <select
                                        value={urgencyLevel} onChange={(e) => setUrgencyLevel(e.target.value as any)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                        Request Status
                                    </label>
                                    <select
                                        value={status} onChange={(e) => setStatus(e.target.value as any)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">info</span>
                                    Additional Notes / Context
                                </label>
                                <textarea
                                    value={notes} onChange={(e) => setNotes(e.target.value)}
                                    className="w-full h-20 p-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                />
                            </div>

                            {formError && (
                                <p className="text-xs text-error font-bold bg-error-container/20 p-3 rounded-lg border border-error/20">
                                    {formError}
                                </p>
                            )}

                            <div className="pt-4 border-t border-outline-variant flex justify-end gap-3 bg-surface-container-lowest">
                                <button
                                    type="button" onClick={() => setIsEditOpen(false)}
                                    className="h-10 px-4 rounded-lg border border-outline hover:bg-surface-container-low text-sm font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit" disabled={updateRequestMutation.isPending}
                                    className="h-10 px-6 rounded-lg bg-primary text-on-primary text-sm font-semibold active:scale-95 transition-transform"
                                >
                                    {updateRequestMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Request Modal */}
            {isViewOpen && selectedRequest && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-outline-variant">
                        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Clinical Case Details</h3>
                            <button onClick={() => setIsViewOpen(false)} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl">
                                <div className="w-12 h-12 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-lg">
                                    {selectedRequest.blood_type?.name}
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-on-surface text-base">Patient Case #{selectedRequest.id}</p>
                                    <p className="text-xs text-on-surface-variant">Registered Seeker ID: #{selectedRequest.seeker_id}</p>
                                </div>
                            </div>
                            <div className="space-y-4 text-sm text-left">
                                <div>
                                    <p className="text-xs font-bold text-on-surface-variant">Medical Center</p>
                                    <p className="font-semibold text-on-surface mt-1">{selectedRequest.hospital_name}</p>
                                    <p className="text-xs text-on-surface-variant mt-0.5">{selectedRequest.hospital_address}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-bold text-on-surface-variant">Units Required</p>
                                        <p className="font-medium text-on-surface mt-1">{selectedRequest.units_required} pints</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-on-surface-variant">Urgency Level</p>
                                        <p className={`font-bold mt-1 text-xs uppercase ${
                                            selectedRequest.urgency_level === 'critical' ? 'text-primary' : 'text-on-surface'
                                        }`}>{selectedRequest.urgency_level}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-on-surface-variant">Case Note / Clinical Description</p>
                                    <p className="font-medium text-on-surface mt-1 bg-surface-container-low p-3 rounded-lg border border-outline-variant text-xs italic leading-relaxed">
                                        {selectedRequest.notes || 'No case clinical notes provided.'}
                                    </p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-outline-variant flex justify-end">
                                <button
                                    onClick={() => setIsViewOpen(false)}
                                    className="h-10 px-6 rounded-lg bg-primary text-on-primary text-sm font-semibold active:scale-95"
                                >
                                    Close Portal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </SidebarLayout>
    );
};

export default BloodRequests;
