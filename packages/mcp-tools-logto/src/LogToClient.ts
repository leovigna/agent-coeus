import { createManagementApi } from "@logto/api/management";

export type LogToClient = ReturnType<typeof createManagementApi>["apiClient"];
