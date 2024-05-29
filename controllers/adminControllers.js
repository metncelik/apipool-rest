import { getTable, getTables } from "../queries/adminQueries.js";

export const getTableByID = async (req, res) => {
    const { tableID } = req.params;

    if (isNaN(tableID)) {
        return res.status(400).send({ "message": "Invalid table ID." });
    }

    const tables = await getTables();

    if (tables.rows.length <= parseInt(tableID) || parseInt(tableID) < 0) {
        return res.status(400).send({ "message": "Invalid table ID." });
    }

    const table = tables.rows[parseInt(tableID)]
    const tablename = table.tablename;
    const users = await getTable(tablename);
    res.send(users.rows);
}