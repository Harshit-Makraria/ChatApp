import { Client, Databases, Account } from 'appwrite';

const client = new Client();

export const PROJECT_ID = import.meta.env.VITE_PROJECT_ID;
export const DATABASE_ID = import.meta.env.VITE_DATABASE_ID;
export const COLLECTION_ID_MESSAGES = import.meta.env.VITE_COLLECTION_ID_MESSAGES;
export const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

client
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID);

export const databases = new Databases(client);
export const account = new Account(client);

export default client;
