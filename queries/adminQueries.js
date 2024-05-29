import pgPool from "../database/postgres.js";

export const getTables = async () => {
    const tables = await pgPool.query(`
    SELECT tablename FROM pg_catalog.pg_tables 
    WHERE schemaname = 'public'
    `);
    return tables;
}

export const getTable = async (tablename) => {
    const table = await pgPool.query(`SELECT * FROM ${tablename}`);
    return table;
}