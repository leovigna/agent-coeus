# MCP Tools LogTo

MCP Tools for interacting with [LogTo](https://logto.io/) Admin API to manage multi-tenant MCP Servers.

These tools are designed to be usable with [MCP Typescript SDK](https://github.com/modelcontextprotocol/typescript-sdk) but could also support any similar SDK with a similar interface.

The purpose of this package is to keep the implementation of tools modular:
- Easy to integrate into any custom MCP server
- Limited dependencies are marked as `peerDependencies` to keep things flexible

## Dependencies
- [zod](https://www.npmjs.com/package/zod)
- [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- [@logto/api](https://www.npmjs.com/package/@logto/api)
