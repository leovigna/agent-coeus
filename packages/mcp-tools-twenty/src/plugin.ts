import type { LogToClient } from "@coeus-agent/mcp-tools-logto";

import {
    createCompanyProcedureFactory,
    createMessageProcedureFactory,
    createNoteProcedureFactory,
    createPersonProcedureFactory,
    createTaskProcedureFactory,
    createWebhookProcedureFactory,
    deleteCompanyProcedureFactory,
    deleteMessageProcedureFactory,
    deleteNoteProcedureFactory,
    deletePersonProcedureFactory,
    deleteTaskProcedureFactory,
    deleteWebhookProcedureFactory,
    findCompaniesProcedureFactory,
    findMessagesProcedureFactory,
    findNotesProcedureFactory,
    findPeopleProcedureFactory,
    findTasksProcedureFactory,
    findWebhooksProcedureFactory,
    getCompanyProcedureFactory,
    getMessageProcedureFactory,
    getNoteProcedureFactory,
    getPersonProcedureFactory,
    getTaskProcedureFactory,
    getWebhookProcedureFactory,
    updateCompanyProcedureFactory,
    updateMessageProcedureFactory,
    updateNoteProcedureFactory,
    updatePersonProcedureFactory,
    updateTaskProcedureFactory,
    updateWebhookProcedureFactory,
} from "./sdk/index.js";
import type {
    TwentyCoreClientProvider,
    TwentyMetadataClientProvider,
} from "./TwentyClient.js";

export function createTwentyCorePlugin(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    const createCompany = createCompanyProcedureFactory(ctx);
    const deleteCompany = deleteCompanyProcedureFactory(ctx);
    const findCompanies = findCompaniesProcedureFactory(ctx);
    const getCompany = getCompanyProcedureFactory(ctx);
    const updateCompany = updateCompanyProcedureFactory(ctx);

    const createPerson = createPersonProcedureFactory(ctx);
    const deletePerson = deletePersonProcedureFactory(ctx);
    const findPeople = findPeopleProcedureFactory(ctx);
    const getPerson = getPersonProcedureFactory(ctx);
    const updatePerson = updatePersonProcedureFactory(ctx);

    const createTask = createTaskProcedureFactory(ctx);
    const deleteTask = deleteTaskProcedureFactory(ctx);
    const findTasks = findTasksProcedureFactory(ctx);
    const getTask = getTaskProcedureFactory(ctx);
    const updateTask = updateTaskProcedureFactory(ctx);

    const createNote = createNoteProcedureFactory(ctx);
    const deleteNote = deleteNoteProcedureFactory(ctx);
    const findNotes = findNotesProcedureFactory(ctx);
    const getNote = getNoteProcedureFactory(ctx);
    const updateNote = updateNoteProcedureFactory(ctx);

    const createMessage = createMessageProcedureFactory(ctx);
    const deleteMessage = deleteMessageProcedureFactory(ctx);
    const findMessages = findMessagesProcedureFactory(ctx);
    const getMessage = getMessageProcedureFactory(ctx);
    const updateMessage = updateMessageProcedureFactory(ctx);

    return {
        createCompany,
        deleteCompany,
        findCompanies,
        getCompany,
        updateCompany,
        createPerson,
        deletePerson,
        findPeople,
        getPerson,
        updatePerson,
        createTask,
        deleteTask,
        findTasks,
        getTask,
        updateTask,
        createNote,
        deleteNote,
        findNotes,
        getNote,
        updateNote,
        createMessage,
        deleteMessage,
        findMessages,
        getMessage,
        updateMessage,
    };
}

export function createTwentyMetadataPlugin(ctx: {
    logToClient: LogToClient;
    twentyMetadataClientProvider: TwentyMetadataClientProvider;
}) {
    const createWebhook = createWebhookProcedureFactory(ctx);
    const deleteWebhook = deleteWebhookProcedureFactory(ctx);
    const findWebhooks = findWebhooksProcedureFactory(ctx);
    const getWebhook = getWebhookProcedureFactory(ctx);
    const updateWebhook = updateWebhookProcedureFactory(ctx);

    return {
        createWebhook,
        deleteWebhook,
        findWebhooks,
        getWebhook,
        updateWebhook,
    };
}
