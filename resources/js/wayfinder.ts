export interface RouteQueryOptions {
    [key: string]: string | number | boolean | null | undefined;
}

export interface RouteDefinition<Methods extends string = string> {
    url: string;
    method: Methods;
}

export interface RouteFormDefinition<Methods extends string = string> {
    url: string;
    method: Methods;
}

export function queryParams(options?: RouteQueryOptions): string {
    if (!options || typeof options !== 'object' || Object.keys(options).length === 0) {
        return '';
    }

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(options)) {
        if (value !== null && value !== undefined) {
            params.append(key, String(value));
        }
    }

    const query = params.toString();
    return query ? `?${query}` : '';
}

export function applyUrlDefaults(url: string, defaults?: RouteQueryOptions): string {
    return url + queryParams(defaults);
}
