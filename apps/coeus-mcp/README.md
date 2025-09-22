# Zep MCP

## Client Configs
### Custom ChatGPT
https://blog.logto.io/gpt-action-oauth
https://chatgpt.com/gpts/editor/

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
    - Update LogTo Client Redirect URIs

## API Scopes

### Full Scope Request
- `offline_access read:user:custom-data update:user:custom-data create:org read:org list:orgs update:org delete:org create:graph read:graph list:graphs update:graph delete:graph`

### User Custom Data
- `read:user:custom-data`
- `update:user:custom-data`

### Org
- `create:org`
- `read:org`
- `list:orgs`
- `update:org`
- `delete:org`

### Graph
- `create:graph`
- `read:graph`
- `list:graphs`
- `update:graph`
- `delete:graph`
