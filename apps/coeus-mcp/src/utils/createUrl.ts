/**
 * Create a URL by combining a base URL and a path.
 * @param base The base URL.
 * @param path The path to append to the base URL.
 * @returns The combined URL.
 */
export function createUrl(base: string, path: string): string {
    // Ensure base ends with a single slash
    if (!base.endsWith("/")) {
        base += "/";
    }

    // Ensure path does not start with a slash
    if (path.startsWith("/")) {
        path = path.substring(1);
    }

    return new URL(path, base).toString();
}
