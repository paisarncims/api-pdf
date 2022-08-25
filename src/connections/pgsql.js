const { Pool, Client } = require("pg");

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined) {
    dbConfigPgsql = {
        host: process.env.IGC_POSTGRES_Host,
        user: process.env.IGC_POSTGRES_Username,
        password: process.env.IGC_POSTGRES_Password,
        database: process.env.IGC_POSTGRES_DatabaseName,
        port: process.env.IGC_POSTGRES_Port,
    }
    // console.log("NODE DEVELOPMENT")

} else if (process.env.NODE_ENV === 'production') {
    dbConfigPgsql = {
        host: process.env.IGC_POSTGRES_Host,
        user: process.env.IGC_POSTGRES_Username,
        password: process.env.IGC_POSTGRES_Password,
        database: process.env.IGC_POSTGRES_DatabaseName,
        port: process.env.IGC_POSTGRES_Port,
    }
    // console.log("NODE PRODUCTION")

} else {

    dbConfigPgsql = {
        host: process.env.IGC_POSTGRES_Host,
        user: process.env.IGC_POSTGRES_Username,
        password: process.env.IGC_POSTGRES_Password,
        database: process.env.IGC_POSTGRES_DatabaseName,
        port: process.env.IGC_POSTGRES_Port,
    }
}


async function dynamicQuery(query, values) {
    try {
        const pool = new Pool(dbConfigPgsql);
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

