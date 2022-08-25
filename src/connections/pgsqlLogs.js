const { Pool, Client } = require("pg");

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined) {
    dbConfigPgsqlLogs = {
        host: process.env.DRM_LOGS_Host,
        user: process.env.DRM_LOGS_Username,
        password: process.env.DRM_LOGS_Password,
        database: process.env.DRM_LOGS_DatabaseName,
        port: process.env.DRM_LOGS_Port,
    }
} else if (process.env.NODE_ENV === 'production') {
    dbConfigPgsqlLogs = {
        host: process.env.DRM_LOGS_Host,
        user: process.env.DRM_LOGS_Username,
        password: process.env.DRM_LOGS_Password,
        database: process.env.DRM_LOGS_DatabaseName,
        port: process.env.DRM_LOGS_Port,
    }
} else {
    dbConfigPgsqlLogs = {
        host: process.env.DRM_LOGS_Host,
        user: process.env.DRM_LOGS_Username,
        password: process.env.DRM_LOGS_Password,
        database: process.env.DRM_LOGS_DatabaseName,
        port: process.env.DRM_LOGS_Port,
    }
}


async function dynamicQuery(query, values) {
    try {
        const pool = new Pool(dbConfigPgsqlLogs);
        const result = await pool.query(query, values);
        await pool.end();
        if (result?.rows) {
            return result.rows;
        } else {
            return result;
        }
    } catch (err) {
        return err;
    }
}

module.exports = { dynamicQuery };

