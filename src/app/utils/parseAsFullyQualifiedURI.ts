export default function parseAsFullyQualifiedURI(uri: string) {
    let origin = '';
    try {
        const urlObj = new URL(uri);
        origin = urlObj.origin;

        // Apply replacement only to the pathname, leaving the rest (search, hash) intact
        urlObj.pathname = urlObj.pathname.replace(/\/{2,}/g, '/');

        uri = urlObj.pathname + urlObj.search + urlObj.hash;
    } catch {}

    return { origin, uri };
}
