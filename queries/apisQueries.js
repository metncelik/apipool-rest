import pgPool from "../database/postgres.js"

export const getPublicAPIs = async (offset, limit) => {
    const queryString = `
    SELECT  api_id, m.title as api_title, m.alias, m.description,  m.image_url 
    FROM apis m
    WHERE m.api_id > $1 
    AND is_public = TRUE
    ORDER BY m.api_id  LIMIT $2 
    `;
    const values = [offset, limit];
    const result = await pgPool.query(queryString, values);
    return result.rows;
};

export const getUserAPIsByID = async (userId) => {
    const queryString = `
    SELECT api_id, title, alias, is_public, created_at
    FROM apis WHERE user_id = $1
    `;
    const values = [userId];
    const result = await pgPool.query(queryString, values);
    return result.rows;
}

export const getFullAPI = async (alias) => {
    const queryString = `
    SELECT e.api_id, e.title,e.alias, e.description, e.image_url 
    FROM apis e
    WHERE e.alias = $1
    AND e.is_public = TRUE
    `;
    const values = [alias];
    const result = await pgPool.query(queryString, values);
    return result.rows[0];
};

export const getAPIInputs = async (apiId) => {
    const queryString = `
    SELECT title, description, type, is_required, default_value
    FROM api_inputs WHERE api_id = $1
    `;
    const values = [apiId];
    const result = await pgPool.query(queryString, values);
    return result.rows;
}

export const getAPIOutputs = async (apiId) => {
    const queryString = `
    SELECT title, description, type
    FROM api_outputs WHERE api_id = $1
    `;
    const values = [apiId];
    const result = await pgPool.query(queryString, values);
    return result.rows;
}

export const queryAPIs = async (attribute, query) => {
    const queryString = `
    SELECT m.api_id, m.title as api_title,m.alias, m.description as category_title, m.image_url
    FROM apis m 
    WHERE ${attribute} LIKE $1`;
    const values = [`%${query}%`];
    const result = await pgPool.query(queryString, values);
    return result.rows;
};

export const addNewAPI = async (api, userId) => {
    const { title, description, alias, imageURL } = api;
    const queryString = `
    INSERT INTO apis (title, description, alias, user_id, image_url)
    VALUES ($1,$2,$3,$4,$5) RETURNING api_id`;
    const values = [title, description, alias, userId, imageURL];
    const result = await pgPool.query(queryString, values);
    return result.rows[0].api_id;
}

export const asignCategoryToAPI = async (apiId, categoryId) => {
    const queryString = `
    INSERT INTO apis_categories (api_id, category_id)
    VALUES ($1,$2)`;
    const values = [apiId, categoryId];
    return await pgPool.query(queryString, values);
}

export const addAPIInput = async (apiId, input) => {
    const { title, description, type, isRequired, defaultValue, isAdvanced } = input;
    console.log(title);
    const queryString = `
    INSERT INTO api_inputs (api_id, title, description, type, is_required, default_value, is_advanced)
    VALUES ($1,$2,$3,$4,$5,$6,$7)`;
    const values = [apiId, title, description, type, isRequired, defaultValue, isAdvanced || false];
    return await pgPool.query(queryString, values);
}

export const addAPIOutput = async (apiId, output) => {
    const { title, description, type } = output;
    const queryString = `
    INSERT INTO api_outputs (api_id, title, description, type)
    VALUES ($1,$2,$3,$4)`;
    const values = [apiId, title, description, type];
    return await pgPool.query(queryString, values);
}

export const addAPIProvider = async (apiId, title) => {
    const queryString = `
    INSERT INTO api_providers(api_id, title) VALUES($1, $2) 
    RETURNING api_provider_id
    `;
    const values = [apiId, title];
    const result = await pgPool.query(queryString, values);
    return result.rows[0].api_provider_id
}

export const addRunpodAPI = async (apiProviderId, rpAPIId, rpAccountId) => {
    const queryString = `
    INSERT INTO runpod_apis (api_provider_id, rp_api_id, rp_account_id)
    VALUES ($1, $2, $3)`;
    const values = [apiProviderId, rpAPIId, rpAccountId]
    return await pgPool.query(queryString, values);
}

export const getRunpodAccountByEmail = async (email) => {
    const queryString = `
    SELECT account_id FROM runpod_accounts WHERE email = $1`;
    const values = [email];
    const result = await pgPool.query(queryString, values);
    return result.rows;
}

export const deleteAPIByID = async (apiId, userId) => {
    const queryString = `
    DELETE FROM apis WHERE api_id = $1 AND user_id = $2`;
    const values = [apiId, userId];
    return await pgPool.query(queryString, values);
}