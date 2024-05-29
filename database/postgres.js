import pg from 'pg';
import { pgConfig } from '../config.js';

const pool = new pg.Pool(pgConfig);

pool.on('connect', (a) => {
    console.log(`Connected to the database ${pgConfig.database}`);
});

pool.on('error', (err, client) => {
    console.error(`Unexpected error on idle client ${err.message} ${err.stack}`);
});

pool.on('remove', (err, client) => {
    // console.error(`removed`);
});

export default pool;