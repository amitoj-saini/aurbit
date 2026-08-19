import type { UserLocation } from '@/lib/api';

export function timeAgo(timestamp: string | Date): string {
    const date = new Date(`${timestamp}Z`);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();

    const minutes = Math.floor(diffMs / (1000 * 60));

    if (minutes <= 1) {
        return "Now";
    }

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 30) {
        return `${days}d ago`;
    }

    const months = Math.floor(days / 30);

    if (months < 12) {
        return `${months}mo ago`;
    }

    const years = Math.floor(months / 12);

    return `${years}y ago`;
}

export function formattedLocationName(user: UserLocation) {
    let location = `${user.latitude}, ${user.longitude}`;
    if (user.street_number && user.street) location = `${user.street_number} ${user.street}`
    else if (user.city && user.region) location = `${user.city}, ${user.region}`
    else if (user.region && user.country) location = `${user.region}, ${user.country}`
    return location;
}

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