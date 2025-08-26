import fastify from 'fastify';
import { createDb } from '@coeus-agent/ops-db';
import { GraphClient } from '@coeus-agent/graph-client';
import { validateRequest } from '@coeus-agent/mcp-kit';
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
});

const server = fastify({ logger: true });

const db = createDb(process.env.DATABASE_URL!, process.env.DATABASE_AUTH_TOKEN);
const graphClient = new GraphClient(
    process.env.NEO4J_URI!,
    process.env.NEO4J_USERNAME!,
    process.env.NEO4J_PASSWORD!
);

server.post('/', async (request, reply) => {
    const validation = validateRequest(request.body);
    if (!validation.success) {
        return reply.status(400).send({ error: 'Invalid MCP request' });
    }

    const { method, params } = validation.data;

    // TODO: Implement tool and resource handling
    logger.info(`Received request for method: ${method}`);

    return { result: 'Not implemented' };
});

server.listen({ port: 3000 }, (err, address) => {
    if (err) {
        logger.error(err);
        process.exit(1);
    }
    logger.info(`Server listening at ${address}`);
});
