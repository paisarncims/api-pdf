const configMongodb = () => {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined) {
        dbConfigMongo = {
            username: process.env.MONGODB_Username,
            password: process.env.MONGODB_Password,
            host: process.env.MONGODB_Host,
            dbname: process.env.MONGODB_DatabaseName,
            port: process.env.MONGODB_Port,
        }
        MongoClient_url = `mongodb+srv://${dbConfigMongo.username}:${dbConfigMongo.password}@${dbConfigMongo.host}/${dbConfigMongo.dbname}?authSource=admin&replicaSet=cims-mongodb&tls=true`
        dbConfigMongo.MongoClient_url = MongoClient_url;
        return dbConfigMongo;

    } else if (process.env.NODE_ENV === 'production') {
        dbConfigMongo = {
            username: process.env.MONGODB_Username,
            password: process.env.MONGODB_Password,
            host: process.env.MONGODB_Host,
            dbname: process.env.MONGODB_DatabaseName,
            port: process.env.MONGODB_Port,
        }
        MongoClient_url = `mongodb+srv://${dbConfigMongo.username}:${dbConfigMongo.password}@${dbConfigMongo.host}/${dbConfigMongo.dbname}?authSource=admin&replicaSet=cims-mongodb&tls=true`
        dbConfigMongo.MongoClient_url = MongoClient_url

        return dbConfigMongo;
    } else {

        dbConfigMongo = {
            username: process.env.MONGODB_Username,
            password: process.env.MONGODB_Password,
            host: process.env.MONGODB_Host,
            dbname: process.env.MONGODB_DatabaseName,
            port: process.env.MONGODB_Port,
        }
        MongoClient_url = `mongodb+srv://${dbConfigMongo.username}:${dbConfigMongo.password}@${dbConfigMongo.host}/${dbConfigMongo.dbname}?authSource=admin&replicaSet=cims-mongodb&tls=true`
        dbConfigMongo.MongoClient_url = MongoClient_url
        
        return dbConfigMongo
    }
}


module.exports = { configMongodb }