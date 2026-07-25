import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../api/client.ts';
import { SidebarLayout } from '../components/SidebarLayout.tsx';
import { User } from '../hooks/useAuth.ts';

interface PaginatedUsers {
    success: boolean;
    message: string;
    data: User[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const Users: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || '');
    const [page, setPage] = useState(1);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Sync role query param on navigation
    useEffect(() => {
        setRoleFilter(searchParams.get('role') || '');
        setPage(1);
    }, [searchParams]);

    // Form inputs state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [role, setRole] = useState<'donor' | 'seeker' | 'admin'>('seeker');
    const [location, setLocation] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);
    const [formError, setFormError] = useState<string | null>(null);

    // Fetch live users from the dynamic UserController API
    const { data: usersData, isLoading } = useQuery<PaginatedUsers>({
        queryKey: ['users-list', page, search, roleFilter],
        queryFn: async () => {
            const { data } = await apiClient.get('/users', {
                params: {
                    page,
                    search,
                    role: roleFilter
                }
            });
            return data;
        }
    });

    // Add User mutation
    const registerMutation = useMutation({
        mutationFn: async (userData: any) => {
            const { data } = await apiClient.post('/register', userData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users-list'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            setIsAddOpen(false);
            resetForm();
        },
        onError: (err: any) => {
            setFormError(err.response?.data?.message || 'Error occurred while saving user record.');
        }
    });

    // Edit User mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
            const { data } = await apiClient.put(`/users/${id}`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users-list'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            setIsEditOpen(false);
            resetForm();
        },
        onError: (err: any) => {
            setFormError(err.response?.data?.message || 'Error occurred while updating user record.');
        }
    });

    // Delete User mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.delete(`/users/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users-list'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to delete user.');
        }
    });

    const resetForm = () => {
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setPasswordConfirmation('');
        setRole('seeker');
        setLocation('');
        setIsAvailable(true);
        setFormError(null);
        setSelectedUser(null);
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (password !== passwordConfirmation) {
            setFormError('The password confirmation does not match.');
            return;
        }

        registerMutation.mutate({
            name,
            email,
            phone,
            password,
            password_confirmation: passwordConfirmation,
            role,
            location,
            is_available: isAvailable
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        setFormError(null);

        if (password && password !== passwordConfirmation) {
            setFormError('The password confirmation does not match.');
            return;
        }

        const payload: any = {
            name,
            email,
            phone,
            role,
            location,
            is_available: isAvailable
        };

        if (password) {
            payload.password = password;
            payload.password_confirmation = passwordConfirmation;
        }

        updateMutation.mutate({ id: selectedUser.id, payload });
    };

    const triggerEdit = (usr: User) => {
        setSelectedUser(usr);
        setName(usr.name);
        setEmail(usr.email);
        setPhone(usr.phone || '');
        setRole(usr.role as any);
        setLocation(usr.location || '');
        setIsAvailable(usr.is_available ?? true);
        setPassword('');
        setPasswordConfirmation('');
        setFormError(null);
        setIsEditOpen(true);
    };

    const triggerDelete = (usr: User) => {
        if (confirm(`Are you sure you want to permanently delete user ${usr.name}?`)) {
            deleteMutation.mutate(usr.id);
        }
    };

    return (
        <SidebarLayout>
            <div className="px-6 pt-24 pb-8 space-y-8">
                {/* Filters Area */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="relative w-full md:w-96 group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline bg-white focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none text-body-md"
                            placeholder="Search by name or email..."
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <select
                            value={roleFilter}
                            onChange={(e) => {
                                const newRole = e.target.value;
                                setRoleFilter(newRole);
                                setPage(1);
                                if (newRole) {
                                    setSearchParams({ role: newRole });
                                } else {
                                    setSearchParams({});
                                }
                            }}
                            className="flex-1 md:flex-none px-4 py-3 rounded-xl border border-outline bg-white font-label-md text-label-md outline-none"
                        >
                            <option value="">All Roles</option>
                            <option value="admin">Administrator</option>
                            <option value="coordinator">Coordinator</option>
                            <option value="donor">Donor</option>
                            <option value="seeker">Seeker</option>
                        </select>
                        <button
                            onClick={() => { resetForm(); setIsAddOpen(true); }}
                            className="flex-1 md:flex-none bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-sm"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Add New User
                        </button>
                    </div>
                </div>

                {/* Table View (Bento Card Style) */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-outline-variant shadow-sm">
                        <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
                        <p className="text-on-surface-variant mt-4 font-body-md">Retrieving healthcare users...</p>
                    </div>
                ) : (
                    <div className="glass-card rounded-2xl shadow-sm overflow-hidden mb-8 border border-outline-variant">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-surface-container-low border-b border-outline-variant">
                                    <tr>
                                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant">
                                    {(!usersData?.data || usersData.data.length === 0) ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant text-sm font-medium">
                                                No matching records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        usersData.data.map((usr) => (
                                            <tr key={usr.id} className="hover:bg-surface-container-low transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold">
                                                            {usr.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="font-body-lg text-body-lg font-semibold leading-tight text-on-surface">{usr.name}</p>
                                                            <p className="text-on-surface-variant text-xs">{usr.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit ${
                                                        usr.role === 'admin' ? 'bg-primary-fixed text-on-primary-fixed-variant' :
                                                        usr.role === 'coordinator' ? 'bg-secondary-fixed text-on-secondary-fixed-variant' :
                                                        'bg-surface-container-highest text-on-surface-variant'
                                                    }`}>
                                                        {usr.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-body-md text-on-surface-variant text-left">
                                                    {usr.location || 'Not Specified'}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${usr.is_available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                        <span className="text-xs font-medium text-on-surface">{usr.is_available ? 'Active' : 'Unavailable'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right flex justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(usr);
                                                            setIsViewOpen(true);
                                                        }}
                                                        className="p-1.5 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant"
                                                        title="View Details"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                    </button>
                                                    <button
                                                        onClick={() => triggerEdit(usr)}
                                                        className="p-1.5 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant"
                                                        title="Edit User"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => triggerDelete(usr)}
                                                        className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors text-on-surface-variant"
                                                        title="Delete User"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Area */}
                        {usersData && usersData.meta.total > 0 && (
                            <div className="p-6 border-t border-outline-variant flex items-center justify-between">
                                <span className="text-on-surface-variant text-sm">
                                    Showing {((page - 1) * 10) + 1}-{Math.min(page * 10, usersData.meta.total)} of {usersData.meta.total} users
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline hover:bg-surface-container-low transition-colors disabled:opacity-30 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined">chevron_left</span>
                                    </button>
                                    <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-on-primary font-bold">
                                        {page}
                                    </button>
                                    <button
                                        onClick={() => setPage(p => Math.min(usersData.meta.last_page || 1, p + 1))}
                                        disabled={page === usersData.meta.last_page}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline hover:bg-surface-container-low transition-colors disabled:opacity-30 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add User Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-outline-variant">
                        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Add New User</h3>
                            <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-left">
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">person</span>
                                        Full Name
                                    </label>
                                    <input
                                        type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                        placeholder="Sarah Mitchell"
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
                                        placeholder="s.mitchell@hemoglobin.org"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-left">
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">phone</span>
                                        Phone Number
                                    </label>
                                    <input
                                        type="text" required value={phone} onChange={(e) => setPhone(e.target.value)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                        placeholder="+15550199"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">badge</span>
                                        Select Role
                                    </label>
                                    <select
                                        value={role} onChange={(e) => setRole(e.target.value as any)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                    >
                                        <option value="admin">Administrator</option>
                                        <option value="coordinator">Coordinator</option>
                                        <option value="seeker">Seeker</option>
                                        <option value="donor">Donor</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-left">
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">lock</span>
                                        Password
                                    </label>
                                    <input
                                        type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">lock</span>
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password" required value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                                    Location Address
                                </label>
                                <input
                                    type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                                    className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                    placeholder="Brooklyn, NY"
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-2 text-left">
                                <input
                                    type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)}
                                    id="isAvailableInput" className="w-5 h-5 rounded text-primary focus:ring-primary/20"
                                />
                                <label htmlFor="isAvailableInput" className="text-sm font-semibold text-on-surface-variant cursor-pointer">
                                    Active / Available
                                </label>
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
                                    type="submit" disabled={registerMutation.isPending}
                                    className="h-10 px-6 rounded-lg bg-primary text-on-primary text-sm font-semibold active:scale-95 transition-transform"
                                >
                                    {registerMutation.isPending ? 'Saving...' : 'Add User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {isEditOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-outline-variant">
                        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Edit User Details</h3>
                            <button onClick={() => setIsEditOpen(false)} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-left">
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
                            <div className="grid grid-cols-2 gap-4 text-left">
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
                                        <span className="material-symbols-outlined text-[18px]">badge</span>
                                        Select Role
                                    </label>
                                    <select
                                        value={role} onChange={(e) => setRole(e.target.value as any)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                    >
                                        <option value="admin">Administrator</option>
                                        <option value="coordinator">Coordinator</option>
                                        <option value="seeker">Seeker</option>
                                        <option value="donor">Donor</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-left">
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">lock</span>
                                        New Password (Optional)
                                    </label>
                                    <input
                                        type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">lock</span>
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                                    Location Address
                                </label>
                                <input
                                    type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                                    className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-md font-body-md"
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-2 text-left">
                                <input
                                    type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)}
                                    id="isAvailableInput" className="w-5 h-5 rounded text-primary focus:ring-primary/20"
                                />
                                <label htmlFor="isAvailableInput" className="text-sm font-semibold text-on-surface-variant cursor-pointer">
                                    Active / Available
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
                                    type="submit" disabled={updateMutation.isPending}
                                    className="h-10 px-6 rounded-lg bg-primary text-on-primary text-sm font-semibold active:scale-95 transition-transform"
                                >
                                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View User Modal */}
            {isViewOpen && selectedUser && (
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
                                    {selectedUser.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-on-surface text-base">{selectedUser.name}</p>
                                    <p className="text-xs text-on-surface-variant">{selectedUser.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-left">
                                <div>
                                    <p className="text-xs font-bold text-on-surface-variant">Phone Number</p>
                                    <p className="font-medium text-on-surface mt-1">{selectedUser.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-on-surface-variant">Role</p>
                                    <p className="font-medium text-on-surface mt-1 uppercase">{selectedUser.role}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-on-surface-variant">Location</p>
                                    <p className="font-medium text-on-surface mt-1">{selectedUser.location || 'Not Specified'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-on-surface-variant">Registration Date</p>
                                    <p className="font-medium text-on-surface mt-1">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
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

export default Users;
