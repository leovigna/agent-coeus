import { beforeAll, afterAll } from 'vitest';
import { GenericContainer, Neo4jContainer } from 'testcontainers';

beforeAll(async () => {
    const neo4j = await new Neo4jContainer().start();
    const graphiti = await new GenericContainer('graphiti/graphiti')
        .withExposedPorts(8080)
        .withEnv('NEO4J_URI', neo4j.getBoltUri())
        .withEnv('NEO4J_USERNAME', 'neo4j')
        .withEnv('NEO4J_PASSWORD', 'password')
        .start();

    process.env.TEST_NEO4J_URI = neo4j.getBoltUri();
    process.env.TEST_GRAPHITI_URL = `http://${graphiti.getHost()}:${graphiti.getMappedPort(8080)}`;
});

afterAll(async () => {
    // Cleanup
});
