import pgPool from "../database/postgres.js";

const addUser = async () => {
    const queryString = 'INSERT INTO users DEFAULT VALUES RETURNING user_id';
    const result = await pgPool.query(queryString);
    return result.rows[0].user_id;
}

const getEmailAndPasswordByID = async (userId) => {
    const queryString = `SELECT e.email, e.hashed_password FROM users u JOIN auth_methods a ON u.user_id = a.user_id AND a.provider = 'Email' JOIN email_auth e ON a.method_id = e.method_id WHERE u.user_id = $1`;
    const values = [userId];
    const result = await pgPool.query(queryString, values);
    return result.rows[0];
}

const getUserByEmail = async (email) => {
    const queryString = `SELECT u.user_id, e.hashed_password, e.verified, u.role FROM users u JOIN auth_methods a ON u.user_id = a.user_id AND a.provider = 'Email' JOIN email_auth e ON a.method_id = e.method_id WHERE email = $1`;
    const values = [email];
    const result = await pgPool.query(queryString, values);
    return result.rows[0];
}

const updatePassword = async (email, newHashedPassword) => {
    const queryString = `UPDATE email_auth SET hashed_password = $1 WHERE email = $2`;
    const values = [newHashedPassword, email ];
    await pgPool.query(queryString, values);
    return true;
}

const updateLoginDate = async (userId) => {
    const queryString = 'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE user_id = $1 RETURNING last_login_at';
    const values = [userId];
    const result = await pgPool.query(queryString, values);
    return result;
}

const updateRefreshToken = async (userId, refreshToken) => {
    const queryString = 'UPDATE refresh_tokens SET refresh_token = $2 WHERE user_id = $1 RETURNING refresh_token';
    const values = [userId, refreshToken];
    const result = await pgPool.query(queryString, values);
    return result.rows[0];
}

const getRefreshToken = async (userId) => {
    const queryString = 'SELECT refresh_token from refresh_tokens WHERE user_id = $1';
    const values = [userId];
    const result = await pgPool.query(queryString, values);
    console.log(result);
    return result.rows[0].refresh_token;
}

const createUserWithEmailPassword = async (email, hashed_password, verifySecret) => {
    const queryString = 'SELECT create_user_with_email_password($1, $2, $3)';
    const values = [email, hashed_password, verifySecret];
    const result = await pgPool.query(queryString, values);
    return result.rows[0].create_user_with_email_password;
}

const createUserWithGoogleAuth = async ({ id, email, name, picture, verified_email }) => {
    const queryString = 'SELECT create_user_with_google_auth($1, $2, $3, $4, $5)';
    const values = [id, email, name, verified_email, picture];
    const result = await pgPool.query(queryString, values);
    return result.rows[0].create_user_with_google_auth;
}

const googleAuthExists = async (googleID) => {
    const queryString = 'SELECT EXISTS(SELECT 1 FROM google_auth WHERE google_uid = $1)';
    const values = [googleID];
    const result = await pgPool.query(queryString, values);
    return result.rows[0].exists;
}

const getUserByGoogleID = async (googleID) => {
    const queryString = `SELECT u.user_id, u.role FROM users u JOIN auth_methods a ON u.user_id = a.user_id AND a.provider ='Google' JOIN google_auth g ON a.method_id = g.method_id WHERE g.google_uid = $1`;
    const values = [googleID];
    const result = await pgPool.query(queryString, values);
    return result.rows[0];
}

const addAuthMethodGoogle = async ({ id, email, name, picture, verified_email }, userId) => {
    const queryString = 'SELECT add_google_auth_method($1, $2, $3, $4, $5, $6)';
    const values = [id, email, name, verified_email, picture, userId];
    const result = await pgPool.query(queryString, values);
    return result.rows[0].add_google_auth_method;
}

const githubAuthExists = async (githubID) => {
    const queryString = 'SELECT EXISTS(SELECT 1 FROM github_auth WHERE github_uid = $1)';
    const values = [githubID];
    const result = await pgPool.query(queryString, values);
    return result.rows[0].exists;
}

const createUserWithGithubAuth = async ({ id, name, avatar_url }, { email, verified }) => {
    const queryString = 'SELECT create_user_with_github_auth($1, $2, $3, $4, $5)';
    const values = [id, email, name, avatar_url, verified];
    const result = await pgPool.query(queryString, values);
    return result.rows[0].create_user_with_github_auth;
}

const getuserByGithubID = async (githubID) => {
    const queryString = `SELECT u.user_id, u.role FROM users u JOIN auth_methods a ON u.user_id = a.user_id AND a.provider ='Github' JOIN github_auth g ON a.method_id = g.method_id WHERE g.github_uid = $1`;
    const values = [githubID];
    const result = await pgPool.query(queryString, values);
    return result.rows[0];
}

const addAuthMethodGithub = async ({ id, name, avatar_url }, { email, verified }, userId) => {
    const queryString = 'SELECT add_github_auth_method($1, $2, $3, $4, $5, $6)';
    const values = [id, email, name, avatar_url, verified, userId];
    const result = await pgPool.query(queryString, values);
    return result.rows[0].add_github_auth_method;
}

const getEmailVerificationBySecret = async (verifySecret) => {
    const queryString = 'SELECT email_sent_at, verified FROM email_auth WHERE secret_key = $1';
    const values = [verifySecret];
    const result = await pgPool.query(queryString, values);
    return result.rows[0];
}

const getEmailVerificationByEmail = async (email) => {
    const queryString = 'SELECT email_sent_at, verified FROM email_auth WHERE email = $1';
    const values = [email];
    const result = await pgPool.query(queryString, values);
    return result.rows[0];
}

const changePasswordByEmailSecret = async (secretKey ,hashed_password) => {
    const queryString = 'UPDATE email_auth SET hashed_password = $1 WHERE email = (SELECT e.email FROM email_auth e JOIN auth_methods a ON e.method_id = a.method_id WHERE e.secret_key = $2) RETURNING email';
    const values = [hashed_password, secretKey];
    const result = await pgPool.query(queryString, values);
    return result.rows[0]?.email;
}

const verifyEmailAuth = async (verifySecret) => {
    const queryString = 'UPDATE email_auth SET verified = true WHERE secret_key = $1 RETURNING verified';
    const values = [verifySecret];
    const result = await pgPool.query(queryString, values);
}

const addAuthMethodEmail = async (email, hashedPassword, verifySecret, userId) => {
    const queryString = 'SELECT add_email_auth_method($1, $2, $3, $4)';
    const values = [email, hashedPassword, verifySecret, userId];
    const result = await pgPool.query(queryString, values);
    return result.rows[0].add_email_auth_method;
}

const updateEmailSecretKey = async (email, secretKey) => {
    const queryString = 'UPDATE email_auth SET secret_key = $1, email_sent_at = CURRENT_TIMESTAMP WHERE email = $2 RETURNING secret_key';
    const values = [secretKey, email];
    const result = await pgPool.query(queryString, values);
    return result.rows[0];
}

const deleteEmailSecretKey = async (secretKey) => {
    const queryString = 'UPDATE email_auth SET secret_key = NULL WHERE secret_key = $1';
    const values = [secretKey];
    await pgPool.query(queryString, values);
}

const getAllAuthMethods = async (userId) => {
    const queryString = `SELECT provider, email, added_at, verified FROM emails WHERE user_id = $1`;
    const values = [userId];
    const result = await pgPool.query(queryString, values);
    console.log("huha",result);
    return result.rows;
}

export {
    addUser,
    getEmailAndPasswordByID,
    getUserByEmail,
    updatePassword,
    updateLoginDate,
    updateRefreshToken,
    getRefreshToken,
    createUserWithGoogleAuth,
    googleAuthExists,
    getUserByGoogleID,
    createUserWithEmailPassword,
    githubAuthExists,
    createUserWithGithubAuth,
    getuserByGithubID,
    addAuthMethodGoogle,
    addAuthMethodGithub,
    addAuthMethodEmail,
    getAllAuthMethods,
    getEmailVerificationBySecret,
    getEmailVerificationByEmail,
    verifyEmailAuth,
    updateEmailSecretKey,
    changePasswordByEmailSecret,
    deleteEmailSecretKey
}