# Zep MCP

## Integrations
### Zep Cloud
Add a custom zep cloud project to your organization using the `zepApiKey` when creating an organization.

### Twenty CRM
Add TwentyCRM integration to your organization using the `twentyApiKey` and `twentyWebhookSecret` when creating an organization.

## Client Configs
### Custom ChatGPT
https://blog.logto.io/gpt-action-oauth

Current live GPTs
- [Development](https://chatgpt.com/g/g-68cd5c1588a08191bdbceac311002291-development-coeus-gpt?model=gpt-5)
- [Staging](https://chatgpt.com/g/g-68bea1c9625881918615156829f9b66c-coeus-gpt?model=gpt-5)

Complete the instructions in this order.

- Go to "Actions" section and add an action
- ImportOpenAPI Spec
    - http://localhost:3000/openapi.json
    - Remove localhost server
    - Update version tag
- Authentication
    - Select OAuth
    - Fillout Client ID, Client Secret
    - Authorization URL https://neat-perfectly-buck.ngrok-free.app/oidc/auth
    - Token URL: https://neat-perfectly-buck.ngrok-free.app/oidc/token
    - Scope (see below)
- Callback url
    - Go back to main Custom GPT page
    - Copy Callback URL https://chat.openai.com/aip/g-${id}/oauth/callback (WARNING: This changes as you update certain params such as Auth config)
    - Update Logto Client Redirect URIs

## API Scopes

### Full Scope Request
- `offline_access read:user:custom-data write:user:custom-data create:org list:orgs read:org write:org delete:org read:graph write:graph delete:graph read:crm write:crm`

### User Custom Data
**User Scopes**
- `read:user:custom-data`
- `write:user:custom-data`

### Org
**User Scopes**
- `create:org`
- `list:orgs`

**Org Scopes**
- `read:org`
- `write:org`
- `delete:org`

### Zep Graph
**Org Scopes**
- `read:graph`
- `write:graph`
- `delete:graph`

### Twenty CRM
- `read:crm`
- `write:crm`
