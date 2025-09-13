/**
 * Simple util checks if all scopes are included
 * @param userScopes
 * @param requiredScopes
 * @returns true if auth scopes fulfill requirement
 */
export const hasRequiredScopes = (userScopes: string[], requiredScopes: string[]): boolean => {
    return requiredScopes.every(scope => userScopes.includes(scope));
};

/**
     *
     * **Notes from mcp-auth:**
     *
     * This interface has been extended to include additional fields that are supported by mcp-auth.
     * These fields can be used in the MCP handlers to provide more context about the authenticated
     * identity.
     */
export interface AuthInfo {
    /**
         *
         * **Notes from mcp-auth:**
         *
         * The raw access token received in the request.
         */
    token: string;
    /**
         * The issuer of the access token, which is typically the OAuth / OIDC provider that issued
         * the token. This is usually a URL that identifies the authorization server.
         *
         * @see https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.1
         * @see https://openid.net/specs/openid-connect-core-1_0.html#IssuerIdentifier
         */
    issuer: string;
    /**
         *
         * **Notes from mcp-auth:**
         *
         * The client ID which identifies the OAuth client that the token was issued to. This is
         * typically the client ID registered with the OAuth / OIDC provider.
         *
         * Some providers may use "application ID" or similar terms instead of "client ID".
         */
    clientId: string;
    /**
         *
         * **Notes from mcp-auth:**
         *
         * The scopes (permissions) that the access token has been granted. Scopes define what actions
         * the token can perform on behalf of the user or client. Normally, you need to define these
         * scopes in the OAuth / OIDC provider and assign them to the {@link subject} of the token.
         *
         * The provider may support different mechanisms for defining and managing scopes, such as
         * role-based access control (RBAC) or fine-grained permissions.
         */
    scopes: string[];
    expiresAt?: number;
    /**
         * The `sub` (subject) claim of the token, which typically represents the user ID or principal
         * that the token is issued for.
         *
         * @see https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.2
         */
    subject?: string;
    /**
         * The `aud` (audience) claim of the token, which indicates the intended recipient(s) of the
         * token.
         *
         * For OAuth / OIDC providers that support Resource Indicators (RFC 8707), this
         * claim can be used to specify the intended Resource Server (API) that the token is meant for.
         *
         * @see https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.3
         * @see https://datatracker.ietf.org/doc/html/rfc8707
         */
    audience?: string | string[];
    /**
         * The raw claims from the token, which can include any additional information provided by the
         * token issuer.
         */
    claims?: Record<string, unknown>;
}
