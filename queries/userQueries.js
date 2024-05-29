import pgPool from "../database/postgres.js";

// function join user auth limit 1 get auth
const getUser = async (userId) => {
    const queryString = `SELECT u.balance FROM users u WHERE user_id = $1`;
    const values = [userId];
    const result = await pgPool.query(queryString, values);
    return result.rows[0];
}

const getEmail = async (userId, provider) => {
    let queryString;
    let values;
    
    if (!provider) {
        queryString = `SELECT email FROM emails WHERE user_id = $1 ORDER BY added_at DESC LIMIT 1`;
        values = [userId];
    } else {
        queryString = `SELECT email FROM emails WHERE user_id = $1 AND provider = $2`;
        values = [userId, provider];
    }
    
    const result = await pgPool.query(queryString, values);
    return result.rows[0].email;
};

export {
    getUser,
    getEmail
};