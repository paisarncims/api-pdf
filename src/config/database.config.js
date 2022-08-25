const configMongodb = () => {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined) {
        dbConfigMongo = {
            username: process.env.IGC_MONGODB_Username,
            password: process.env.IGC_MONGODB_Password,
            host: process.env.IGC_MONGODB_Host,
            dbname: process.env.IGC_MONGODB_DatabaseName,
            port: process.env.IGC_MONGODB_Port,
        }
        MongoClient_url = `mongodb://${dbConfigMongo.username}:${dbConfigMongo.password}@${dbConfigMongo.host}:${dbConfigMongo.port}/${dbConfigMongo.dbname}`
        dbConfigMongo.MongoClient_url = MongoClient_url;
        
        return dbConfigMongo;
    } else if (process.env.NODE_ENV === 'production') {
        dbConfigMongo = {
            username: process.env.IGC_MONGODB_Username,
            password: process.env.IGC_MONGODB_Password,
            host: process.env.IGC_MONGODB_Host,
            dbname: process.env.IGC_MONGODB_DatabaseName,
            port: process.env.IGC_MONGODB_Port,
        }
        MongoClient_url = `mongodb://${dbConfigMongo.username}:${dbConfigMongo.password}@${dbConfigMongo.host}:${dbConfigMongo.port}/${dbConfigMongo.dbname}`
        dbConfigMongo.MongoClient_url = MongoClient_url

        return dbConfigMongo;
    } else {
        dbConfigMongo = {
            username: process.env.IGC_MONGODB_Username,
            password: process.env.IGC_MONGODB_Password,
            host: process.env.IGC_MONGODB_Host,
            dbname: process.env.IGC_MONGODB_DatabaseName,
            port: process.env.IGC_MONGODB_Port,
        }
        MongoClient_url = `mongodb://${dbConfigMongo.username}:${dbConfigMongo.password}@${dbConfigMongo.host}:${dbConfigMongo.port}/${dbConfigMongo.dbname}`
        dbConfigMongo.MongoClient_url = MongoClient_url

        return dbConfigMongo
    }
}


module.exports = { configMongodb }