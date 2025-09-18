# Zep MCP Tools

MCP Tools for interacting with [Zep](https://www.getzep.com/) graph database to manage agent context.

These tools are designed to be usable with [MCP Typescript SDK](https://github.com/modelcontextprotocol/typescript-sdk) but could also support any similar SDK with a similar interface.

The purpose of this package is to keep the implementation of tools modular:
- Easy to integrate into any custom MCP server
- Limited dependencies are marked as `peerDependencies` to keep things flexible

## Dependencies
- [zod](https://www.npmjs.com/package/zod)
- [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- [@getzep/zep-cloud](https://www.npmjs.com/package/@getzep/zep-cloud)

## SDK Functions
SDK functions are organized in folders to mimic the zep sdk [reference](https://help.getzep.com/sdk-reference):
- [edge](./src/sdk/edge/): CRUD Graph Edges
- [episode](./src/sdk/episode/): CRUD Graph Episodes
- [graph](./src/sdk/graph/): CRUD / Searhc Graph
