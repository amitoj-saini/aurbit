import * as SecureStore from 'expo-secure-store';

const AURBIT_ENDPOINT_STORAGE_KEY = 'aurbit-endpoint';
const AURBIT_ACCESS_TOKEN_STORAGE_KEY = 'aurbit-access-token';
const AURBIT_USER_ACCESS_TOKEN_STORAGE_KEY = 'aurbit-user-access-token';

export async function fetchAurbitConnectionDetails() {
    const endpoint = await SecureStore.getItemAsync(AURBIT_ENDPOINT_STORAGE_KEY);
    const authToken = await SecureStore.getItemAsync(AURBIT_ACCESS_TOKEN_STORAGE_KEY);
    if (!endpoint || !authToken) throw new Error('Aurbit endpoint has not been configured yet.');
    
    return {
        endpoint: endpoint.replace(/\/$/, ''),
        authToken: authToken
    }
}

export async function storeAurbitConnectionDetails(endpoint: string, authToken: string) {
    try {
        await SecureStore.setItemAsync(AURBIT_ENDPOINT_STORAGE_KEY, endpoint);
        await SecureStore.setItemAsync(AURBIT_ACCESS_TOKEN_STORAGE_KEY, authToken);
    } catch (err) {
        throw new Error(`Unable to store connection details: ${err}`);
    }
}

export async function storeAurbitAccessToken(token: string) {
    try {
        await SecureStore.setItemAsync(AURBIT_USER_ACCESS_TOKEN_STORAGE_KEY, token);
    } catch (err) {
        throw new Error(`Unable to store connection details: ${err}`);
    }
}

export async function fetchAurbitAccessToken() {
    try {
        return await SecureStore.getItemAsync(AURBIT_USER_ACCESS_TOKEN_STORAGE_KEY) || null;
    } catch (err) {
        throw new Error(`Unable to store connection details: ${err}`);
    }
}

export async function deleteAurbitConnectionDetails() {
    try {
        await SecureStore.deleteItemAsync(AURBIT_ENDPOINT_STORAGE_KEY);
        await SecureStore.deleteItemAsync(AURBIT_ACCESS_TOKEN_STORAGE_KEY);
    } catch (err) {
        throw new Error(`Unable to delete connection details: ${err}`);
    }
}