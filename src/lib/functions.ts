export function isValidUrl(value: string) {
    try {
        const parsed = new URL(value);

        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return false;
        }

        // Extract original host before URL normalization
        const match = value.match(/^https?:\/\/([^/:]+)(?::(\d+))?/i);

        if (!match) {
            return false;
        }

        const host = match[1];
        const port = match[2];

        // Validate port
        if (port && (!/^[1-9][0-9]{0,4}$/.test(port) || Number(port) > 65535)) {
            return false;
        }

        // IPv4 must be exactly 4 octets
        const isIPv4 = host.split('.').length === 4 &&
            host.split('.').every(part =>
                /^\d+$/.test(part) &&
                Number(part) >= 0 &&
                Number(part) <= 255
            );

        // Reject partial numeric hosts like "1", "127.0"
        if (/^\d+(\.\d+)*$/.test(host) && !isIPv4) {
            return false;
        }

        // Normal domain validation
        const isFqdn =
            /^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[A-Za-z]{2,63}$/
            .test(host);

        return isIPv4 || isFqdn;

    } catch {
        return false;
    }
}