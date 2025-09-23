import { zepClientDefault } from "../clients/zep-client.js";

async function main() {
    const graphs = await zepClientDefault.graph.listAll();

    for (const graph of graphs.graphs ?? []) {
        await zepClientDefault.graph.delete(graph.graphId!);
    }
}

main().catch(() => {
    process.exit(1);
});
