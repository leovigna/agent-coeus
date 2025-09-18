export interface UserCustomData {
    status?: {
        orgId: string; // Current orgId
        graphId: string; // Current graphId (should be part of orgId)
    };
}
