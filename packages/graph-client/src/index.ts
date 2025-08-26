import neo4j from 'neo4j-driver';
import { z } from 'zod';
import { CompanySchema, PersonSchema, RelationshipSchema } from '@coeus-agent/domain-schemas';

export class GraphClient {
    private driver: neo4j.Driver;

    constructor(uri, username, password) {
        this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
    }

    async close() {
        await this.driver.close();
    }

    async createCompany(company: z.infer<typeof CompanySchema>) {
        const session = this.driver.session();
        try {
            const result = await session.run(
                'CREATE (c:Company {id: $id, name: $name}) RETURN c',
                company
            );
            return result.records[0].get('c').properties;
        } finally {
            await session.close();
        }
    }

    async createPerson(person: z.infer<typeof PersonSchema>) {
        const session = this.driver.session();
        try {
            const result = await session.run(
                'CREATE (p:Person {id: $id, name: $name}) RETURN p',
                person
            );
            return result.records[0].get('p').properties;
        } finally {
            await session.close();
        }
    }

    async createRelationship(relationship: z.infer<typeof RelationshipSchema>) {
        const session = this.driver.session();
        try {
            const result = await session.run(
                'MATCH (a), (b) WHERE a.id = $from AND b.id = $to CREATE (a)-[r:' + relationship.type + ']->(b) RETURN r',
                relationship
            );
            return result.records[0].get('r').properties;
        } finally {
            await session.close();
        }
    }
}
