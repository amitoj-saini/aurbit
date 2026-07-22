import { fetchAurbitAccessToken, fetchAurbitConnectionDetails } from "./storage";

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export class ApiResponse<TData = unknown> {
    constructor(
        readonly data: TData | null,
        readonly err: Error | null,
    ) {}

    isSuccess(): boolean {
        return this.err === null;
    }

    isError(): boolean {
        return this.err !== null;
    }
}

type RequestOptions<TBody = unknown> = {
    method?: HttpMethod;
    body?: TBody;
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean | undefined>;
};

type ApiResult<TData = unknown> = TData & {
    action: string;
    message: string;
    code: number;
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

export async function request<TData = unknown>(path: string, options: RequestOptions = {}): Promise<ApiResponse<TData>> {
    try {
        const connectionDetails = await fetchAurbitConnectionDetails();
        const userAccessToken = await fetchAurbitAccessToken();

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${connectionDetails.authToken}`,
            'Cookie': '',
            ...(options.headers ?? {}),
        };

        if (userAccessToken)
            headers['Cookie'] = `session=${userAccessToken}`;

        const url = new URL(buildUrl(path, options.params), `${connectionDetails.endpoint}/`);

        const response = await fetch(url.toString(), {
            method: options.method ?? 'GET',
            headers,
            body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        });

        const contentType = response.headers.get('content-type') ?? '';
        let payload: ApiEnvelope<TData>;
        
        try {
            payload = contentType.includes('application/json')
                ? ((await response.json()) as ApiEnvelope<TData>)
                : ((await response.text()) as unknown as ApiEnvelope<TData>);
        } catch (parseError) {
            return new ApiResponse<TData>(null, new Error(`Failed to parse response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`));
        }

        if (!response.ok) {
            const fallbackMessage = (payload as { detail?: string })?.detail ?? response.statusText ?? 'Request failed';
            const message = (payload?.result?.message as string | undefined) ?? fallbackMessage;
            return new ApiResponse<TData>(null, new Error(message));
        }

        let data: TData;
        if (payload?.result) {
            if ('data' in payload.result) {
                data = payload.result.data as TData;
            } else {
                data = payload.result as TData;
            }
        } else {
            data = payload as TData;
        }

        return new ApiResponse(data, null);
    } catch (error) {
        return new ApiResponse<TData>(null, error instanceof Error ? error : new Error('Unknown error'));
    }
}

export const appStateApi = {
    getAppState: () => request<{ authenticated: boolean; initialized: boolean; loggedin: boolean }>('/app-state/'),
};

export const usersApi = {
    register: (payload: { displayName: string; email: string; access?: number; password?: string }) =>
        request<ApiResult<{ access_token: string }>>('/users/register', {
            method: 'POST',
            body: payload,
        }),
    login: (payload: { email: string; password: string }) =>
        request<ApiResult<{ access_token: string }>>('/users/login', {
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
    appState: appStateApi,
    users: usersApi,
    location: locationApi,
};
