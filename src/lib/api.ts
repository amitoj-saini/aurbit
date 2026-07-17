import * as SecureStore from 'expo-secure-store';

const AURBIT_ENDPOINT_STORAGE_KEY = 'aurbit-endpoint';
const AURBIT_ACCESS_TOKEN_STORAGE_KEY = 'aurbit-access-token';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

type RequestOptions<TBody = unknown> = {
    method?: HttpMethod;
    body?: TBody;
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean | undefined>;
};

type ApiEnvelope<TData = unknown> = {
    result?: {
        action?: string;
        message?: string;
        code?: number;
        data?: TData;
        [key: string]: unknown;
    };
    [key: string]: unknown;
};

export async function setAuthToken(token: string | null) {
    if (token) {
        await SecureStore.setItemAsync(AURBIT_ACCESS_TOKEN_STORAGE_KEY, token);
        return;
    }

    await SecureStore.deleteItemAsync(AURBIT_ACCESS_TOKEN_STORAGE_KEY);
}

export function clearSecureStore() {
    SecureStore.deleteItemAsync(AURBIT_ENDPOINT_STORAGE_KEY);
    SecureStore.deleteItemAsync(AURBIT_ACCESS_TOKEN_STORAGE_KEY);
}

async function getStoredEndpoint() {
    const endpoint = await SecureStore.getItemAsync(AURBIT_ENDPOINT_STORAGE_KEY);

    if (!endpoint) {
        throw new Error('Aurbit endpoint has not been configured yet.');
    }

    return endpoint.replace(/\/$/, '');
}

async function getAuthHeaders() {
    const token = await SecureStore.getItemAsync(AURBIT_ACCESS_TOKEN_STORAGE_KEY);

    if (!token) {
        return {} as Record<string, string>;
    }

    return {
        Authorization: `Bearer ${token}`,
    };
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const query = params
        ? Object.entries(params)
                .filter(([, value]) => value !== undefined)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
                .join('&')
        : '';

    return `${normalizedPath}${query ? `?${query}` : ''}`;
}

export async function request<TData = unknown>(path: string, options: RequestOptions = {}) {
    const endpoint = await getStoredEndpoint();
    const headers = {
        'Content-Type': 'application/json',
        ...(await getAuthHeaders()),
        ...(options.headers ?? {}),
    };

    const url = new URL(buildUrl(path, options.params), `${endpoint}/`);

    const response = await fetch(url.toString(), {
        method: options.method ?? 'GET',
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    const contentType = response.headers.get('content-type') ?? '';
    const payload = contentType.includes('application/json')
        ? ((await response.json()) as ApiEnvelope<TData>)
        : ((await response.text()) as unknown as ApiEnvelope<TData>);

    if (!response.ok) {
        const fallbackMessage = (payload as { detail?: string })?.detail ?? response.statusText ?? 'Request failed';
        const message = (payload?.result?.message as string | undefined) ?? fallbackMessage;
        throw new Error(message);
    }

    if (payload?.result && 'data' in payload.result) {
        return payload.result.data as TData;
    }

    return payload as TData;
}

export const appStateApi = {
    getAppState: () => request<{ authenticated: boolean; initialized: boolean; loggedin: boolean }>('/app-state/'),
};

export const usersApi = {
    register: (payload: { displayName: string; email: string; access?: number; password?: string }) =>
        request<{ access_token: string }>('/users/register', {
            method: 'POST',
            body: payload,
        }),
    login: (payload: { email: string; password: string }) =>
        request<{ access_token: string }>('/users/login', {
            method: 'POST',
            body: payload,
        }),
};

export const locationApi = {
    update: (payload: { longitude: number; latitude: number; speed?: number | null }) =>
        request('/location/update', {
            method: 'POST',
            body: payload,
        }),
};

export default {
    request,
    setAuthToken,
    appState: appStateApi,
    users: usersApi,
    location: locationApi,
};
