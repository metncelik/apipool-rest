import pgPool from "../database/postgres.js"

export const getPublicEndpoints = async (offset, limit) => {
    const queryString = `
    SELECT  endpoint_id, m.title as endpoint_title, m.alias, m.description, c.title as category_title, m.image_url 
    FROM endpoints m
    JOIN endpoint_categories c ON m.category_id = c.category_id 
    WHERE m.endpoint_id > $1 
    AND is_public = TRUE
    ORDER BY m.endpoint_id  LIMIT $2 
    `;
    const values = [offset, limit];
    const result = await pgPool.query(queryString, values);
    return result.rows;
};

export const getUserEndpointsByID = async (userId) => {
    const queryString = `
    SELECT endpoint_id, title, alias, is_public, created_at
    FROM endpoints WHERE user_id = $1
    `;
    const values = [userId];
    const result = await pgPool.query(queryString, values);
    return result.rows;
}

export const getFullEndpoint = async (alias) => {
    const queryString = `
    SELECT e.endpoint_id, e.title,e.alias, e.description,c.title AS category_title, e.image_url 
    FROM endpoints e 
    JOIN endpoint_categories c ON e.category_id = c.category_id
    WHERE e.alias = $1
    `;
    const values = [alias];
    const result = await pgPool.query(queryString, values);
    return result.rows[0];
};

export const getEndpointInputs = async (endpointId) => {
    const queryString = `
    SELECT title, description, type, is_required, default_value
    FROM endpoint_inputs WHERE endpoint_id = $1
    `;
    const values = [endpointId];
    const result = await pgPool.query(queryString, values);
    return result.rows;
}

export const getEndpointOutputs = async (endpointId) => {
    const queryString = `
    SELECT title, description, type
    FROM endpoint_outputs WHERE endpoint_id = $1
    `;
    const values = [endpointId];
    const result = await pgPool.query(queryString, values);
    return result.rows;
}

export const queryEndpoints = async (attribute, query) => {
    const queryString = `
    SELECT m.endpoint_id, m.title as endpoint_title,m.alias, m.description,c.title as category_title, m.image_url
    FROM endpoints m 
    JOIN endpoint_categories c ON m.category_id = c.category_id
    WHERE ${attribute} LIKE $1`;
    const values = [`%${query}%`];
    const result = await pgPool.query(queryString, values);
    return result.rows;
};

export const addNewEndpoint = async (endpoint, userId) => {
    const { title, description, alias, categoryID, imageURL } = endpoint;
    const queryString = `
    INSERT INTO endpoints (title, description, alias, user_id, category_id, image_url)
    VALUES ($1,$2,$3,$4,$5, $6) RETURNING endpoint_id`;
    const values = [title, description, alias, userId, categoryID, imageURL];
    const result = await pgPool.query(queryString, values);
    return result.rows[0].endpoint_id;
}


export const addEndpointInput = async (endpointId, input) => {
    const { title, description, type, isRequired, defaultValue } = input;
    console.log(title);
    const queryString = `
    INSERT INTO endpoint_inputs (endpoint_id, title, description, type, is_required, default_value)
    VALUES ($1,$2,$3,$4,$5,$6)`;
    const values = [endpointId, title, description, type, isRequired, defaultValue];
    return await pgPool.query(queryString, values);
}

export const addEndpointOutput = async (endpointId, output) => {
    const { title, description, type } = output;
    const queryString = `
    INSERT INTO endpoint_outputs (endpoint_id, title, description, type)
    VALUES ($1,$2,$3,$4)`;
    const values = [endpointId, title, description, type];
    return await pgPool.query(queryString, values);
}

export const addEndpointProvider = async (endpointId, title) => {
    const queryString = `
    INSERT INTO endpoint_providers(endpoint_id, title) VALUES($1, $2) 
    RETURNING endpoint_provider_id
    `;
    const values = [endpointId, title];
    const result = await pgPool.query(queryString, values);
    return result.rows[0].endpoint_provider_id
}

export const addRunpodEndpoint = async (endpointProviderId, rpEndpointId, rpAccountId) => {
    const queryString = `
    INSERT INTO runpod_endpoints (endpoint_provider_id, rp_endpoint_id, rp_account_id)
    VALUES ($1, $2, $3)`;
    const values = [endpointProviderId, rpEndpointId, rpAccountId]
    return await pgPool.query(queryString, values);
}

export const getRunpodAccountByEmail = async (email) => {
    const queryString = `
    SELECT account_id FROM runpod_accounts WHERE email = $1`;
    const values = [email];
    const result = await pgPool.query(queryString, values);
    return result.rows;
}

export const deleteEndpointByID = async (endpointId, userId) => {
    const queryString = `
    DELETE FROM endpoints WHERE endpoint_id = $1 AND user_id = $2`;
    const values = [endpointId, userId];
    return await pgPool.query(queryString, values);
}