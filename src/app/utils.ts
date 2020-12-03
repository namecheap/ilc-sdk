export function parseAsFullyQualifiedURI(uri: string) {
    let origin = '';
    try {
        const urlObj = new URL(uri);
        origin = urlObj.origin;
        uri = urlObj.pathname + urlObj.search + urlObj.hash;
    } catch {}

    return { origin, uri };
}
