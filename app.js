
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const app = express();
const swaggerUi = require('swagger-ui-express');
const mongoose = require('mongoose');
let { configMongodb } = require('./src/config/database.config')

mongoose
    .connect(
        configMongodb().MongoClient_url,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            tls: true,
            tlsCAFile: "./src/config/ca-certificate.crt"
        }
    )
    .then(() => {
        startup()
    })
    .catch(err => console.log(err));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static(__dirname + '/src/public'));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(cookieParser())
app.use(helmet())

app.use((request, response, next) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const APP_PORT = process.env.APP_PORT || 3000;
const APP_NAME = process.env.APP_NAME || 'APP START'
const APP_HOST = process.env.APP_HOST || 'localhost'
const APP_VERSION = process.env.APP_VERSION || '1.0.0'
const APP_ENV = process.env.APP_NODE_ENV || 'development'

let swaggerDocument = require(`./src/swagger/${APP_ENV}.json`);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    explorer: true
}));


require('./api-pdf/routes/index.routes')(app);

async function startup() {
    console.log('Starting application');
    try {
        console.log('Initializing web service');
        server = app.listen(APP_PORT, () => {
            console.log(`Service Has Started AT ${new Date().toString()}`)
            console.log(`${APP_NAME} Service (v.${APP_VERSION}) Listening on http://${APP_HOST}:${APP_PORT}`)
        }
        );
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

async function shutdown(signal) {
    console.log(`Received ${signal} at ${new Date().toISOString()}`);
    try {
        console.log('connection pool closed');
        await server.close();
        console.log('Web server closed');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('message', function (msg) {
    if (msg == 'shutdown') {
        setTimeout(function () {
            shutdown
        }, 1500);
    }
});

