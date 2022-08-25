const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth.config");
const dbPGSQL = require('../connections/pgsqlLogs');

/**
 * 
 * @param {*} action [read, add, update, remove]
 * @returns 
 */
module.exports = (table, action) => {
    return async (req, res, next) => {
        try {
            if (!table) {
                res.status(404).send({
                    "code": 404,
                    "message": "logs require table name.",
                });
            } else {
                action = action || 'no_action';
                /** เพิ่ม Logs */
                let sql = `INSERT INTO ${table}
                       (action, 
                        base_url, 
                        employee_id, 
                        params,
                        query,
                        body)
                   VALUES (
                       '${action}', 
                       '${req.baseUrl}', 
                       '${req.user.employee_id}',
                       '${JSON.stringify(req.params)}',
                       '${JSON.stringify(req.query)}',
                       '${JSON.stringify(req.body)}');`;
                await dbPGSQL.dynamicQuery(sql, [])
                next();
            }

        } catch (error) {
            next();
        }
    }
}

