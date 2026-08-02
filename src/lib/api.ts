import { fetchAurbitAccessToken, fetchAurbitConnectionDetails } from './storage';

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

export type UserLocation = {
    me: boolean;
    image: string,
    userid: number;
    user: string;
    timestamp: Date;
    longitude: number;
    latitude: number;
    speed: number;
};

type RawUserLocation = {
    me: boolean;
    userid: number;
    user: string;
    timestamp: string;
    longitude: number;
    latitude: number;
    speed: number;
};

type LocationStream = {
    close: () => void;
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

function buildWebSocketUrl(path: string, endpoint: string, params?: Record<string, string>) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(buildUrl(normalizedPath), `${endpoint.replace(/\/$/, '')}/`);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.set(key, value);
        });
    }

    return url.toString();
}

async function openWebSocketStream(
    path: string,
    onUpdate: (users: UserLocation[]) => void,
    onError?: (error: Error) => void,
): Promise<LocationStream> {
    const connectionDetails = await fetchAurbitConnectionDetails();
    const userAccessToken = await fetchAurbitAccessToken();

const websocketHeaders: Record<string, string> = {};
    if (connectionDetails?.authToken) {
        websocketHeaders['Authorization'] = 'Bearer ' + connectionDetails.authToken;
    }

    if (userAccessToken) {
        websocketHeaders.Cookie = `session=${userAccessToken}`;
    }

const socketConstructor = WebSocket as unknown as new (
        url: string,
        protocols?: string | string[],
        options?: { headers?: Record<string, string> },
    ) => WebSocket;

    const socket = new socketConstructor(buildWebSocketUrl(path, connectionDetails.endpoint), undefined, {
        headers: websocketHeaders,
    });

    socket.onmessage = (event: MessageEvent) => {
        try {
            const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            const users = Array.isArray(payload?.result?.data?.users)
                ? payload.result.data.users.map((user: RawUserLocation) => ({
                      ...user,
                      timestamp: new Date(user.timestamp),
                  }))
                : null;

            if (users) {
                onUpdate(users);
                return;
            }

            const message = payload?.result?.message ?? 'Invalid location data received';
            onError?.(new Error(String(message)));
        } catch (error) {
            onError?.(error instanceof Error ? error : new Error('Malformed websocket message'));
        }
    };

    socket.onerror = () => {
        onError?.(new Error('WebSocket error while connecting to Aurbit.'));
    };

    socket.onclose = (event: { wasClean: boolean; code: number }) => {
        if (!event.wasClean) {
            onError?.(new Error(`WebSocket closed unexpectedly (${event.code}).`));
        }
    };

    return {
        close: () => socket.close(),
    };
}

export async function request<TData = unknown>(path: string, options: RequestOptions = {}): Promise<ApiResponse<TData>> {
    try {
        const connectionDetails = await fetchAurbitConnectionDetails();
        const userAccessToken = await fetchAurbitAccessToken();

        const headers: Record<string, string> = {
            ...(options.headers ?? {}),
        };

        // only set content-type when a body will be sent for non-GET requests
        if (options.body !== undefined && (options.method ?? 'GET') !== 'GET') {
            headers['Content-Type'] = 'application/json';
        }

        // include server auth token as Bearer when present
        if (connectionDetails?.authToken) {
            headers['Authorization'] = 'Bearer ' + connectionDetails.authToken;
        }

        // preserve caller overrides (if they passed Authorization or Content-Type explicitly)
        Object.assign(headers, options.headers ?? {});

        if (userAccessToken) {
            headers['Cookie'] = `session=${userAccessToken}`;
        }

        const url = new URL(buildUrl(path, options.params), `${connectionDetails.endpoint.replace(/\/$/, '')}/`);
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

    userStatus: (payload: { email: string }) =>
        request<ApiResult<{ initialized: boolean }>>('/users/user-status', {
            method: 'POST',
            body: payload,
        }),

    userDetails: () =>
        request<ApiResult<{ email: string, displayName: string, image: string | null }>>('/users/user-details'),
};

export const locationApi = {
    fetch: async (): Promise<ApiResponse<{ users: UserLocation[] }>> => {
        return new Promise<ApiResponse<{ users: UserLocation[] }>>((resolve) => {
            openWebSocketStream(
                '/location/',
                (users) => {
                    resolve(new ApiResponse<{ users: UserLocation[] }>({ users }, null));
                },
                (error) => {
                    resolve(new ApiResponse<{ users: UserLocation[] }>(null, error));
                },
            ).catch((error) => {
                resolve(new ApiResponse<{ users: UserLocation[] }>(null, error instanceof Error ? error : new Error(String(error))));
            });
        });
    },

    stream: async (
        onUpdate: (users: UserLocation[]) => void,
        onError?: (error: Error) => void,
    ): Promise<LocationStream> => {
        return openWebSocketStream('/location/', onUpdate, onError);
    },

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
