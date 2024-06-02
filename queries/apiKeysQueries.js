import pgPool from "../database/postgres.js";

export const getActiveApiKeys = async (userId) => {
    const query = `SELECT * FROM api_keys WHERE is_revoked = FALSE AND user_id = $1 ORDER BY created_at DESC`;
    const values = [userId];
    const result = await pgPool.query(query, values);
    return result.rows;
};

export const getRequestsCountByHour = async (userId) => {
    const query = `SELECT COUNT(*) AS count, r.status, DATE_TRUNC('hour', finished_at) AS hour 
    FROM recent_requests r JOIN api_keys a ON r.api_key_id = a.api_key_id 
    WHERE a.user_id = $1 AND r.status IN ('COMPLETED', 'FAILED')
    GROUP BY hour, r.status 
    ORDER BY hour ASC`;
    const values = [userId];
    const result = await pgPool.query(query, values);
    console.log(result.rows);
    return result.rows;
};

export const getDelayAndExecutionTimeByHour = async (userId) => {
    const query = `SELECT ROUND(AVG(delay_time)) AS avg_delay, ROUND(AVG(execution_time)) AS avg_execution, DATE_TRUNC('hour', finished_at) AS hour 
    FROM recent_requests r JOIN api_keys a ON r.api_key_id = a.api_key_id 
    WHERE a.user_id = $1 AND r.status IN ('COMPLETED', 'FAILED')
    GROUP BY hour 
    ORDER BY hour ASC`;
    const values = [userId];
    const result = await pgPool.query(query, values);
    return result.rows;
}

export const insertAPIKey = async (apiTitle, apiKey,userId) => {
    const query = `INSERT INTO api_keys (api_key, title, user_id) 
        VALUES ($1, $2, $3) RETURNING api_key, title, created_at`;
    const values = [apiKey, apiTitle, userId];
    const result = await pgPool.query(query, values);
    return result.rows[0];
};

export const revokeAPIKey = async (apiKey, userId) => {
    const query = `UPDATE api_keys SET is_revoked = TRUE WHERE api_key = $1 AND user_id = $2`;
    const values = [apiKey, userId];
    const result = await pgPool.query(query, values);
    return result.rows[0];
};

export const getRecentRequests = async (userId) => {
    const query = `
    SELECT r.request_id, a.title AS api_key_title, e.title AS api_title, r.status, r.finished_at, r.started_at, r.delay_time, r.execution_time  
    FROM recent_requests r JOIN api_keys a ON r.api_key_id = a.api_key_id JOIN apis e ON e.api_id = r.api_id 
    WHERE a.user_id = $1
    ORDER BY r.started_at DESC
    LIMIT 70
    `;
    const values = [userId];
    const result = await pgPool.query(query, values);
    return result.rows;
};