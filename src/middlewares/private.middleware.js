const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth.config");
const dbPGSQL = require('../connections/pgsql');
require('dotenv').config()

module.exports = async (req, res, next) => {
    try {
        const access_token = req.query.access_token
        if (!access_token) {
            const bearerHeader = req.header("authorization");
            const bearer = bearerHeader.split(' ');
            if (bearer[0] == authConfig.EMPLOYEE_AUTH_TOKEN_TYPE) {
                const bearerToken = bearer[1];
                if (!bearerToken) {
                    res.status(401).send({
                        "code": 401,
                        "message": "Unauthorized",
                    });
                } else if (bearerToken == authConfig.EMPLOYEE_ADMIN_PASSWORD) {
                    next();
                } else {
                    try {
                        const decoded = jwt.verify(bearerToken, authConfig.EMPLOYEE_AUTH_PUBLIC_KEY);
                        req.user = decoded;

                        /** ตรวจสอบสถานะพนักงาน */
                        let sql = `select * from igc_auth_employee_account where status_active = true and employee_id = '${req.user.employee_id}';`
                        let employee = await dbPGSQL.dynamicQuery(sql, [])
                        if (employee.length > 0) {
                            let employee_auth_sql = `select * from igc_auth_employee where refresh_token = '${req.user.refreshToken}';`
                            let employee_auth = await dbPGSQL.dynamicQuery(employee_auth_sql, [])
                            if (employee_auth.length && employee_auth[0].auth_active) {
                                next();
                            } else {
                                res.status(401).send({
                                    "code": 401,
                                    "message": "Unauthorized",
                                });
                            }
                        } else {
                            res.status(401).send({
                                "code": 401,
                                "message": "Unauthorized",
                            });
                        }
                    } catch (error) {
                        try {
                            const decoded = jwt.verify(bearerToken, authConfig.CUSTOMER_AUTH_PUBLIC_KEY);
                            req.user = decoded;
                            next();
                        } catch (error) {
                            res.status(401).send({
                                "code": 401,
                                "message": "Unauthorized",
                            });
                        }
                    }
                }
            } else {
                res.status(401).send({
                    "code": 401,
                    message: "Header must be " + authConfig.EMPLOYEE_AUTH_TOKEN_TYPE
                });
            }
        } else {
            try {
                if (access_token == authConfig.EMPLOYEE_ADMIN_PASSWORD) {
                    next();
                } else {
                    const decoded = jwt.verify(access_token, authConfig.EMPLOYEE_AUTH_PUBLIC_KEY);
                    req.user = decoded;

                    /** ตรวจสอบสถานะพนักงาน */
                    let sql = `select * from igc_auth_employee_account where status_active = true and employee_id = '${req.user.employee_id}';`
                    let employee = await dbPGSQL.dynamicQuery(sql, [])
                    if (employee.length > 0) {
                        let employee_auth_sql = `select * from igc_auth_employee where refresh_token = '${req.user.refreshToken}';`
                        let employee_auth = await dbPGSQL.dynamicQuery(employee_auth_sql, [])
                        if (employee_auth.length && employee_auth[0].auth_active) {
                            next();
                        } else {
                            res.status(401).send({
                                "code": 401,
                                "message": "Unauthorized",
                            });
                        }
                    } else {
                        res.status(401).send({
                            "code": 401,
                            "message": "Unauthorized",
                        });
                    }
                }
            } catch (error) {
                try {
                    const decoded = jwt.verify(access_token, authConfig.CUSTOMER_AUTH_PUBLIC_KEY);
                    req.user = decoded;
                    next();
                } catch (error) {
                    res.status(401).send({
                        "code": 401,
                        "message": "Unauthorized",
                    });
                }
            }
        }
    } catch (error) {
        res.status(401).send({
            "code": 401,
            "message": "Unauthorized",
        });
    }
};