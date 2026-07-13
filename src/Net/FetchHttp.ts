import { HttpHeaders, IHttp } from "./Http";

export class FetchHttp implements IHttp {
    async get<TResponse = any, TRequest = any>(url: string, reqData?: TRequest, headers: HttpHeaders = [['Content-Type', 'application/json']]): Promise<TResponse> {
        const query = this.toQuery(reqData);
        return this.request<TResponse>('GET', query ? `${url}${url.includes('?') ? '&' : '?'}${query}` : url, undefined, headers);
    }

    async post<TResponse = any, TRequest = any>(url: string, reqData?: TRequest, headers: HttpHeaders = [['Content-Type', 'application/json']]): Promise<TResponse> {
        return this.request<TResponse>('POST', url, reqData, headers);
    }

    private toQuery(value: unknown): string {
        if (value == null) return '';
        if (typeof value === 'string') return value;
        if (typeof value !== 'object') return String(value);
        const params = new URLSearchParams();
        for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
            if (item == null) continue;
            params.set(key, typeof item === 'object' ? JSON.stringify(item) : String(item));
        }
        return params.toString();
    }

    private async request<TResponse>(method: 'GET' | 'POST', url: string, reqData: unknown, headers: HttpHeaders): Promise<TResponse> {
        const headersObject = Object.fromEntries(headers);
        let body: BodyInit | undefined;
        if (method !== 'GET' && reqData !== undefined) {
            body = headersObject['Content-Type'] === 'application/json' ? JSON.stringify(reqData) : String(reqData);
        }
        const response = await fetch(url, { method, headers: headersObject, body });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const contentType = response.headers.get('content-type');
        return (contentType?.includes('application/json') ? await response.json() : await response.text()) as TResponse;
    }
}
