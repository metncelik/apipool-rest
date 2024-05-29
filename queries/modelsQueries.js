import pgPool from "../database/postgres.js"

export const getPublicModels = async (offset, limit) => {
    const queryString = `
    SELECT  model_id,m.title as model_title,m.alias, m.description,c.title as category_title, m.image_url 
    FROM models m
    JOIN model_categories c ON m.category_id = c.category_id WHERE m.model_id > $1 ORDER BY m.model_id  LIMIT $2 
    `;
    const values = [offset, limit];
    const result = await pgPool.query(queryString, values);
    return result.rows;
};

export const getUserModelsByID = async (userId) => {
    const queryString = `
    SELECT model_id, title, alias, is_public, created_at
    FROM models WHERE user_id = $1
    `;
    const values = [userId];
    const result = await pgPool.query(queryString, values);
    return result.rows;
}

export const getFullModel = async (alias) => {
    const queryString = `
    SELECT m.model_id, m.title,m.alias, m.description,c.title AS category_title, m.image_url 
    FROM models m 
    JOIN model_categories c ON m.category_id = c.category_id
    WHERE m.alias = $1
    `;
    const values = [alias];
    const result = await pgPool.query(queryString, values);
    return result.rows[0];
};

export const getModelInputs = async (modelID) => {
    const queryString = `
    SELECT title, description, type, is_required, default_value
    FROM model_inputs WHERE model_id = $1
    `;
    const values = [modelID];
    const result = await pgPool.query(queryString, values);
    return result.rows;
}

export const getModelOutputs = async (modelID) => {
    const queryString = `
    SELECT title, description, type
    FROM model_outputs WHERE model_id = $1
    `;
    const values = [modelID];
    const result = await pgPool.query(queryString, values);
    return result.rows;
}

export const queryModels = async (attribute, query) => {
    const queryString = `
    SELECT m.model_id, m.title as model_title,m.alias, m.description,c.title as category_title, m.image_url
    FROM models m 
    JOIN model_categories c ON m.category_id = c.category_id
    WHERE ${attribute} LIKE $1`;
    const values = [`%${query}%`];
    const result = await pgPool.query(queryString, values);
    return result.rows;
};

export const addNewModel = async (model, userId) => {
    const { title, description, alias, categoryID, imageURL } = model;
    const queryString = `
    INSERT INTO models (title, description, alias, user_id, category_id, image_url)
    VALUES ($1,$2,$3,$4,$5, $6) RETURNING model_id`;
    const values = [title, description, alias, userId, categoryID, imageURL];
    const result = await pgPool.query(queryString, values);
    return result.rows[0].model_id;
}

export const addModelInput = async (modelID, input) => {
    const { title, description, type, isRequired, defaultValue } = input;
    console.log(title);
    const queryString = `
    INSERT INTO model_inputs (model_id, title, description, type, is_required, default_value)
    VALUES ($1,$2,$3,$4,$5,$6)`;
    const values = [modelID, title, description, type, isRequired, defaultValue];
    return await pgPool.query(queryString, values);
}

export const addModelOutput = async (modelID, output) => {
    const { title, description, type } = output;
    const queryString = `
    INSERT INTO model_outputs (model_id, title, description, type)
    VALUES ($1,$2,$3,$4)`;
    const values = [modelID, title, description, type];
    return await pgPool.query(queryString, values);
}

export const  deleteModelByID = async (modelID, userId) => {
    const queryString = `
    DELETE FROM models WHERE model_id = $1 AND user_id = $2`;
    const values = [modelID, userId];
    return await pgPool.query(queryString, values);
}