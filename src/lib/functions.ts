import type { UserLocation, UserRecord } from '@/lib/api';

export function formatSince(timestamp: string | Date) {
    const date = new Date(`${timestamp}Z`);
    const now = new Date();

    const isToday =
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate();

    return isToday
        ? `${date.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
          })}`
        : `${date.toLocaleDateString([], {
              month: "short",
              day: "numeric",
          })}, ${date.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
          })}`;
}

export function timestampDifference(timestamp1: string, timestamp2: string): string {
    return formatDuration(
        Math.abs(
            new Date(timestamp1).getTime() -
            new Date(timestamp2).getTime()
        )
    );
}

export function humanReadable(timestamp: string) {
    return new Date(`${timestamp}Z`).toLocaleString([], {
        hour: "numeric",
        minute: "2-digit",
    });
}

export function timeAgo(timestamp: string | Date): number {
    const date = new Date(`${timestamp}Z`);
    const now = new Date();

    return now.getTime() - date.getTime();
}

export function formattedTimeAgo(timestamp: string | Date): string {
    const date = new Date(`${timestamp}Z`);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();

    const minutes = Math.floor(diffMs / (1000 * 60));

    if (minutes <= 1) {
        return "Now";
    }

    return `${formatDuration(diffMs)} ago`
}

export function formatDuration(diffMs: number): string {
    const totalSeconds = Math.floor(Math.abs(diffMs) / 1000);

    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);

    const hours = totalHours % 24;
    const days = Math.floor(totalHours / 24);

    if (days > 0) {
        return `${days}d ${hours}h`;
    }

    if (totalHours > 0) {
        return minutes > 0
            ? `${totalHours}h ${minutes}m`
            : `${totalHours}h`;
    }

    if (totalMinutes > 0) {
        return `${totalMinutes}m`;
    }

    return `${totalSeconds}s`;
}

export function formattedLocationName(user: UserLocation | UserRecord) {
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