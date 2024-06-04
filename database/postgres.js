import pg from 'pg';
import { pgConfig } from '../config.js';

const pool = new pg.Pool(pgConfig);

pool.on('connect', (a) => {
});

pool.on('remove', (err, client) => {
});

pool.on('error', (err, client) => {
});


export default pool;