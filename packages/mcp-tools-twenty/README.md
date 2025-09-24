# Twenty MCP Tools

MCP Tools for interacting with [Twenty](https://github.com/twentyhq/twenty) CRM to manage customer relationships.

These tools are designed to be usable with [MCP Typescript SDK](https://github.com/modelcontextprotocol/typescript-sdk) but could also support any similar SDK with a similar interface.

The purpose of this package is to keep the implementation of tools modular:
- Easy to integrate into any custom MCP server
- Limited dependencies are marked as `peerDependencies` to keep things flexible

## Dependencies
- [zod](https://www.npmjs.com/package/zod)
- [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)

## SDK Functions
SDK functions are organized in folders to mimic the default Twenty CRM Data Model:
- [company](./src/sdk/edge/): CRUD Companies
- [people](./src/sdk/episode/): CRUD People
- [tasks](./src/sdk/tasks/): CRUD Tasks
- [messages](./src/sdk/messages/): CRUD Messages (eg. Gmail)

