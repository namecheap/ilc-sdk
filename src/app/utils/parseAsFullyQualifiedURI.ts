type ParsedUri = {
    origin: string;
    path: string;
};

export function parseAsFullyQualifiedURI(uri: string): ParsedUri {
    try {
        // Normalize multiple slashes to a single slash, but don't affect the initial "http://" or "https://"
        const normalizedUri = uri.replace(/([^:])\/{2,}/g, '$1/');

        if (normalizedUri.startsWith('/')) {
            return { origin: '', path: normalizedUri };
        }

        const { origin, pathname, search, hash } = new URL(normalizedUri);

        return {
            origin,
            path: pathname + search + hash,
        };
    } catch {
        return {
            origin: '',
            path: uri,
        };
    }
}
