export interface MCPRequest {
    method: string;
    params: unknown;
}

export interface MCPResponse {
    result?: unknown;
    error?: {
        code: number;
        message: string;
        data?: unknown;
    };
}
