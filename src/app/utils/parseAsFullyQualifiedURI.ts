export default function parseAsFullyQualifiedURI(uri: string) {
    let origin = '';
    try {
        // Normalize multiple slashes to a single slash, but don't affect the initial "http://" or "https://"
        uri = uri.replace(/([^:])\/{2,}/g, '$1/');

        const urlObj = new URL(uri);
        origin = urlObj.origin;
        uri = urlObj.pathname + urlObj.search + urlObj.hash;
    } catch {}

    return { origin, uri };
}
