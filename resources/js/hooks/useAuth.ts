import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client.ts';

export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: 'donor' | 'seeker' | 'admin';
    location: string | null;
    is_available: boolean;
    created_at: string;
    donor_profile?: {
        id: number;
        user_id: number;
        blood_type: {
            id: number;
            name: string;
        };
        last_donation_date: string | null;
        total_donations: number;
        available_status: number;
        is_available: boolean;
    } | null;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

export interface ProfileResponse {
    success: boolean;
    message: string;
    data: User;
}

export function useLogin() {
    return useMutation({
        mutationFn: async (credentials: Record<string, string>) => {
            const { data } = await apiClient.post<LoginResponse>('/login', credentials);
            return data;
        },
    });
}

export function useRegister() {
    return useMutation({
        mutationFn: async (userData: Record<string, any>) => {
            const { data } = await apiClient.post<LoginResponse>('/register', userData);
            return data;
        },
    });
}

export function useLogout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const { data } = await apiClient.post<{ success: boolean; message: string }>('/logout');
            return data;
        },
        onSuccess: () => {
            localStorage.removeItem('token');
            queryClient.setQueryData(['profile'], null);
            queryClient.invalidateQueries();
        },
    });
}

export function useProfile() {
    const token = localStorage.getItem('token');
    return useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            if (!localStorage.getItem('token')) return null;
            const { data } = await apiClient.get<ProfileResponse>('/profile');
            return data.data;
        },
        enabled: !!token,
        retry: false,
    });
}
