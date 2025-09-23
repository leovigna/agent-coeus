import { zepClient } from "../clients/zep-client.js";

async function main() {
    const graphs = await zepClient.graph.listAll();

    for (const graph of graphs.graphs ?? []) {
        await zepClient.graph.delete(graph.graphId!);
    }
}

main().catch(() => {
    process.exit(1);
});
