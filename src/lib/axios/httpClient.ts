/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// 1. Create a pure client-side Axios instance
const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    withCredentials: true, // 👉 CRITICAL: Forces the browser to send your HttpOnly cookies!
    headers: {
        'Content-Type': 'application/json',
    }
});

// 2. Response Interceptor: The Automatic Token Refresher
instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If the backend says 401 Unauthorized, and we haven't tried refreshing yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Attempt to refresh the token. 
                // The browser automatically sends the HttpOnly refreshToken with this request!
                await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });
                
                // If successful, the backend attached a fresh accessToken cookie.
                // Instantly retry the original failed request!
                return instance(originalRequest);
            } catch (refreshError) {
                // If the refresh token is completely dead, force logout
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// 3. Export matching your previous API so you don't have to rewrite your frontend services
export interface ApiRequestOptions {
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
}

export const httpClient = {
    get: <TData>(endpoint: string, options?: ApiRequestOptions) => 
        instance.get<TData>(endpoint, options).then(res => res.data as any),
        
    post: <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions) => 
        instance.post<TData>(endpoint, data, options).then(res => res.data as any),
        
    put: <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions) => 
        instance.put<TData>(endpoint, data, options).then(res => res.data as any),
        
    patch: <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions) => 
        instance.patch<TData>(endpoint, data, options).then(res => res.data as any),
        
    delete: <TData>(endpoint: string, options?: ApiRequestOptions) => 
        instance.delete<TData>(endpoint, options).then(res => res.data as any),
};