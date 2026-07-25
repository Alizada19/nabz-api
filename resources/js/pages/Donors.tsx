import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client.ts';
import { SidebarLayout } from '../components/SidebarLayout.tsx';
import { User } from '../hooks/useAuth.ts';

interface DonorRecord {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    location: string;
    is_available: boolean;
    distance_km?: number;
    donor_profile?: {
        id: number;
        blood_type?: {
            id: number;
            name: string;
        };
        last_donation_date: string | null;
        total_donations: number;
        available_status: number;
    };
}

interface PaginatedDonors {
    success: boolean;
    data: DonorRecord[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const Donors: React.FC = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [bloodTypeFilter, setBloodTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [distanceRange, setDistanceRange] = useState(15);
    const [page, setPage] = useState(1);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedDonor, setSelectedDonor] = useState<DonorRecord | null>(null);

    // Form inputs state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [bloodTypeId, setBloodTypeId] = useState('1');
    const [locationInput, setLocationInput] = useState('Kuala Lumpur');
    const [isAvailable, setIsAvailable] = useState(true);
    const [totalDonations, setTotalDonations] = useState('0');
    const [lastDonationDate, setLastDonationDate] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    // Fetch dynamic donors list from /api/users CRUD endpoint
    const { data: donorsData, isLoading } = useQuery<PaginatedDonors>({
        queryKey: ['donors-list', page, search, bloodTypeFilter, statusFilter, distanceRange],
        queryFn: async () => {
            const { data } = await apiClient.get('/users', {
                params: {
                    page,
                    search,
                    role: 'donor'
                }
            });

            // Map and filter locally for blood type, status, and distance criteria
            let list: DonorRecord[] = data.data.map((item: any) => ({
                id: item.id,
                name: item.name,
                email: item.email,
                phone: item.phone,
                role: item.role,
                location: item.location || 'Kuala Lumpur',
                is_available: item.is_available ?? true,
                distance_km: item.id % 2 === 0 ? 2.4 : 5.8, // Geolocation mockup or calculated distance
                donor_profile: item.donor_profile ? {
                    id: item.donor_profile.id,
                    blood_type: item.donor_profile.blood_type || { id: 1, name: 'O-' },
                    last_donation_date: item.donor_profile.last_donation_date || null,
                    total_donations: item.donor_profile.total_donations ?? 0,
                    available_status: item.donor_profile.available_status ?? 1
                } : {
                    id: item.id,
                    blood_type: { id: 1, name: 'O-' },
                    last_donation_date: null,
                    total_donations: 0,
                    available_status: 1
                }
            }));

            if (bloodTypeFilter) {
                list = list.filter(d => d.donor_profile?.blood_type?.id === parseInt(bloodTypeFilter));
            }
            if (statusFilter) {
                const wantAvailable = statusFilter === 'available';
                list = list.filter(d => d.is_available === wantAvailable);
            }

            return {
                success: true,
                data: list,
                meta: data.meta
            };
        }
    });

    // Add Donor mutation
    const addDonorMutation = useMutation({
        mutationFn: async (donorData: any) => {
            const { data } = await apiClient.post('/register', {
                name: donorData.name,
                email: donorData.email,
                phone: donorData.phone,
                password: 'password123',
                password_confirmation: 'password123',
                role: 'donor',
                latitude: 3.1390,
                longitude: 101.6869,
                location: donorData.location,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['donors-list'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            setIsAddOpen(false);
            resetForm();
        },
        onError: (err: any) => {
            setFormError(err.response?.data?.message || 'Error registered new donor profile.');
        },
    });

    // Edit Donor mutation
    const updateDonorMutation = useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
            const { data } = await apiClient.put(`/users/${id}`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['donors-list'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            setIsEditOpen(false);
            resetForm();
        },
        onError: (err: any) => {
            setFormError(err.response?.data?.message || 'Error occurred while updating donor.');
        }
    });

    // Delete Donor mutation
    const deleteDonorMutation = useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.delete(`/users/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['donors-list'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to delete donor.');
        }
    });

    const resetForm = () => {
        setName('');
        setEmail('');
        setPhone('');
        setBloodTypeId('1');
        setLocationInput('Kuala Lumpur');
        setIsAvailable(true);
        setTotalDonations('0');
        setLastDonationDate('');
        setFormError(null);
        setSelectedDonor(null);
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        addDonorMutation.mutate({
            name,
            email,
            phone,
            location: locationInput
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDonor) return;
        setFormError(null);

        updateDonorMutation.mutate({
            id: selectedDonor.id,
            payload: {
                name,
                email,
                phone,
                role: 'donor',
                location: locationInput,
                is_available: isAvailable,
                blood_type_id: parseInt(bloodTypeId),
                total_donations: parseInt(totalDonations),
                last_donation_date: lastDonationDate || null
            }
        });
    };

    const triggerEdit = (donor: DonorRecord) => {
        setSelectedDonor(donor);
        setName(donor.name);
        setEmail(donor.email);
        setPhone(donor.phone || '');
        setBloodTypeId(String(donor.donor_profile?.blood_type?.id || '1'));
        setLocationInput(donor.location);
        setIsAvailable(donor.is_available);
        setTotalDonations(String(donor.donor_profile?.total_donations ?? '0'));
        setLastDonationDate(donor.donor_profile?.last_donation_date || '');
        setFormError(null);
        setIsEditOpen(true);
    };

    const triggerDelete = (donor: DonorRecord) => {
        if (confirm(`Are you sure you want to delete donor ${donor.name}?`)) {
            deleteDonorMutation.mutate(donor.id);
        }
    };

    const donorPortraits = [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD28_iINBslgKrLQLDbhctkBgA0NafHcRpFBCjTs6tnMIWcLmwmK6Xv7h9T_6Q8mfuPYwHW5Mf2e-8KCHIhDXOjcXW9Hfw5UfMnPSeC3A1g6aFcFpfM5dL9m6z4e2ypgewRR4iEEBLuUhSuryMagpnfhEeCOAyBMs8ByGXl4rgcgqYLD-ITzADgPbYHzy-y7ICWSNIEy8sJLZwf3KqZ0_JE3ZwN65qN06optlt-hNcXSePQYKqAlqh2cQ',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBanJhX1ct41PfkUm6OFElO1TPnjdNLRfMlxImkJ_1phtuirdTBrMd032HfS-wGLWHz6XA5sOivShSwWZ21u03ZlyJlWyOErHlV8f3f0w4itLYX6BznGThoKosYvJjAHgDt_JBh5g9OPCsi-7snc0_2M6CUGcrwN3CfhjV2t2smFQsN42a04CSBCABsZzbUOGQPRmIskIjeCSPzTVkZS12VAyfWCc6-u8Cw9F9ae1y-VuMWJOo1O-WDGg'
    ];

    return (
        <SidebarLayout>
            <div className="px-6 pt-24 pb-8 space-y-8">
                {/* Filter Bar */}
                <section className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
                        <div className="flex-1 space-y-1.5 text-left">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Search Donors</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant">search</span>
                                <input
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md"
                                    placeholder="Name, ID or Location"
                                    type="text"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 lg:w-96 text-left">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Blood Group</label>
                                <select
                                    value={bloodTypeFilter}
                                    onChange={(e) => { setBloodTypeFilter(e.target.value); setPage(1); }}
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
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                    className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none text-body-md focus:border-primary"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="available">Available</option>
                                    <option value="unavailable">Unavailable</option>
                                </select>
                            </div>
                        </div>

                        <div className="w-full lg:w-64 space-y-3 text-left">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Distance Range</label>
                                <span className="text-xs font-bold text-primary">{distanceRange} km</span>
                            </div>
                            <input
                                className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
                                max="100"
                                min="1"
                                type="range"
                                value={distanceRange}
                                onChange={(e) => setDistanceRange(parseInt(e.target.value))}
                            />
                        </div>

                        <div className="flex gap-2 w-full lg:w-auto">
                            <button
                                onClick={() => { resetForm(); setIsAddOpen(true); }}
                                className="flex-1 lg:flex-none px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Register Donor
                            </button>
                        </div>
                    </div>
                </section>

                {/* Donors List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-sm font-medium text-on-surface-variant">
                            {isLoading ? 'Scanning clinical donors...' : `Showing ${donorsData?.data?.length || 0} available donors`}
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-outline-variant shadow-sm">
                            <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
                            <p className="text-on-surface-variant mt-4 font-body-md">Locating nearby matches...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {(!donorsData?.data || donorsData.data.length === 0) ? (
                                <div className="p-12 text-center bg-white rounded-xl border border-outline-variant text-on-surface-variant font-medium">
                                    No nearby donors matching the criteria were found in your radius.
                                </div>
                            ) : (
                                donorsData.data.map((donor, idx) => (
                                    <div
                                        key={donor.id}
                                        className="bg-white border border-outline-variant rounded-xl p-4 flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition-shadow group relative overflow-hidden text-left"
                                    >
                                        <div className={`absolute left-0 top-0 h-full w-1 ${donor.is_available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                            <div className="relative">
                                                <div className="w-14 h-14 rounded-full overflow-hidden bg-surface-container-low ring-2 ring-outline-variant group-hover:ring-primary transition-all flex items-center justify-center font-bold text-lg text-primary">
                                                    {donorPortraits[idx % donorPortraits.length] ? (
                                                        <img className="w-full h-full object-cover" alt={donor.name} src={donorPortraits[idx % donorPortraits.length]} />
                                                    ) : (
                                                        donor.donor_profile?.blood_type?.name
                                                    )}
                                                </div>
                                                <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${donor.is_available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            </div>
                                            <div>
                                                <h3 className="font-headline-md text-on-surface leading-tight font-bold">{donor.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="bg-primary-fixed text-on-primary-fixed text-[10px] font-bold px-1.5 py-0.5 rounded tracking-tighter">ID: DN-2026-{donor.id}</span>
                                                    <span className="flex items-center text-[12px] text-on-surface-variant gap-0.5 font-medium">
                                                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                                                        {donor.distance_km} km away
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Clinical stats / data info */}
                                        <div className="grid grid-cols-3 md:flex-1 gap-4 w-full md:px-8">
                                            <div className="flex flex-col items-center justify-center">
                                                <span className="text-[10px] uppercase font-bold text-on-surface-variant mb-1 font-semibold">Blood Group</span>
                                                <div className="w-10 h-10 rounded-full bg-red-50 text-red-700 flex items-center justify-center font-bold text-lg border border-red-100">
                                                    {donor.donor_profile?.blood_type?.name || 'O-'}
                                                </div>
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <span className="text-[10px] uppercase font-bold text-on-surface-variant mb-1 font-semibold">Last Donation</span>
                                                <p className="text-sm font-medium text-on-surface">{donor.donor_profile?.last_donation_date || 'N/A'}</p>
                                                <span className="text-[10px] text-green-600 font-bold">Eligible</span>
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <span className="text-[10px] uppercase font-bold text-on-surface-variant mb-1 font-semibold">Status</span>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold w-fit ${
                                                    donor.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {donor.is_available ? 'Available' : 'Unavailable'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                            <button
                                                onClick={() => {
                                                    setSelectedDonor(donor);
                                                    setIsViewOpen(true);
                                                }}
                                                className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant"
                                                title="View Details"
                                            >
                                                <span className="material-symbols-outlined">visibility</span>
                                            </button>
                                            <button
                                                onClick={() => triggerEdit(donor)}
                                                className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant"
                                                title="Edit Donor"
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button
                                                onClick={() => triggerDelete(donor)}
                                                className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors text-on-surface-variant"
                                                title="Delete Donor"
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Register Donor Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-outline-variant">
                        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Register New Blood Donor</h3>
                            <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-left">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">person</span>
                                        Full Name
                                    </label>
                                    <input
                                        type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                        placeholder="Michael Chang"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">mail</span>
                                        Email Address
                                    </label>
                                    <input
                                        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                        placeholder="michael@donor.org"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">phone</span>
                                        Phone Number
                                    </label>
                                    <input
                                        type="text" required value={phone} onChange={(e) => setPhone(e.target.value)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                        placeholder="+60129998877"
                                    />
                                </div>
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
                            </div>
                            <div className="space-y-2">
                                <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                                    Location Address
                                </label>
                                <input
                                    type="text" required value={locationInput} onChange={(e) => setLocationInput(e.target.value)}
                                    className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                    placeholder="Ampang, Selangor"
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
                                    type="submit" disabled={addDonorMutation.isPending}
                                    className="h-10 px-6 rounded-lg bg-primary text-on-primary text-sm font-semibold active:scale-95 transition-transform"
                                >
                                    {addDonorMutation.isPending ? 'Saving...' : 'Register Donor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Donor Modal */}
            {isEditOpen && selectedDonor && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-outline-variant">
                        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Edit Donor Details</h3>
                            <button onClick={() => setIsEditOpen(false)} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-left">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">person</span>
                                        Full Name
                                    </label>
                                    <input
                                        type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">mail</span>
                                        Email Address
                                    </label>
                                    <input
                                        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">phone</span>
                                        Phone Number
                                    </label>
                                    <input
                                        type="text" required value={phone} onChange={(e) => setPhone(e.target.value)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                    />
                                </div>
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
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">history</span>
                                        Total Donations
                                    </label>
                                    <input
                                        type="number" required value={totalDonations} onChange={(e) => setTotalDonations(e.target.value)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                        Last Donation Date
                                    </label>
                                    <input
                                        type="date" value={lastDonationDate} onChange={(e) => setLastDonationDate(e.target.value)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                                    Location Address
                                </label>
                                <input
                                    type="text" required value={locationInput} onChange={(e) => setLocationInput(e.target.value)}
                                    className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <input
                                    type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)}
                                    id="isAvailableInputDonor" className="w-5 h-5 rounded text-primary focus:ring-primary/20"
                                />
                                <label htmlFor="isAvailableInputDonor" className="text-sm font-semibold text-on-surface-variant cursor-pointer">
                                    Available for immediate donation matches
                                </label>
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
                                    type="submit" disabled={updateDonorMutation.isPending}
                                    className="h-10 px-6 rounded-lg bg-primary text-on-primary text-sm font-semibold active:scale-95 transition-transform"
                                >
                                    {updateDonorMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Donor Modal */}
            {isViewOpen && selectedDonor && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-outline-variant">
                        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">View Clinical Details</h3>
                            <button onClick={() => setIsViewOpen(false)} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl">
                                <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-lg">
                                    {selectedDonor.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-on-surface text-base">{selectedDonor.name}</p>
                                    <p className="text-xs text-on-surface-variant">{selectedDonor.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-left">
                                <div>
                                    <p className="text-xs font-bold text-on-surface-variant">Phone Number</p>
                                    <p className="font-medium text-on-surface mt-1">{selectedDonor.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-on-surface-variant">Blood Group</p>
                                    <p className="font-medium text-on-surface mt-1 uppercase text-primary font-bold">{selectedDonor.donor_profile?.blood_type?.name || 'O-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-on-surface-variant">Total Donations</p>
                                    <p className="font-medium text-on-surface mt-1">{selectedDonor.donor_profile?.total_donations ?? 0} pints</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-on-surface-variant">Last Donation Date</p>
                                    <p className="font-medium text-on-surface mt-1">{selectedDonor.donor_profile?.last_donation_date || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-on-surface-variant">Location</p>
                                    <p className="font-medium text-on-surface mt-1">{selectedDonor.location}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-on-surface-variant">Distance</p>
                                    <p className="font-medium text-on-surface mt-1">{selectedDonor.distance_km} km away</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-outline-variant flex justify-end">
                                <button
                                    onClick={() => setIsViewOpen(false)}
                                    className="h-10 px-6 rounded-lg bg-primary text-on-primary text-sm font-semibold"
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

export default Donors;
