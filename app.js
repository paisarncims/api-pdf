require('dotenv').config()
const express = require('express')
const multer = require('multer')
const cors = require('cors')
const path = require('path')
const mkdirp = require('mkdirp')
const bodyParser = require('body-parser');
var methodOverride = require('method-override')
const fs = require('fs');
var sizeOf = require('image-size');
const imageThumbnail = require('image-thumbnail');
var sharp = require('sharp');
const { base64encode, base64decode } = require('nodejs-base64');
const authEmployee = require('./src/middlewares/employee.middleware');
const html_to_pdf = require('html-pdf-node');
const qpdf = require('node-qpdf')
const authConfig = require('./src/config/auth.config')
const pdfConfig = require('./src/config/pdf.config')
const mongoose = require('mongoose');
let { configMongodb } = require('./src/config/database.config')

mongoose
    .connect(
        configMongodb().MongoClient_url,
        { useNewUrlParser: true }
    )
    .then(() => {
        startup()
    })
    .catch(err => console.log(err));


function logErrors(err, req, res, next) {
    console.error(err.stack)
    next(err)
}

function errorHandler(err, req, res, next) {
    // res.status(500)
    res.status(500).send({
        result: false,
        code: '999',
        payload: 'Internal Server Error มีข้อผิดพลาดบางอย่างภายใน ไม่ทราบสาเหตุ',
        message: err.message
    })
}
function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.status(500).send({ error: 'Something failed!' })
    } else {
        next(err)
    }
}

let app = express()
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));
app.use(express.json({ limit: '500mb' }));

let corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
}

app.use(cors(corsOptions));
app.use(methodOverride());
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

require('./api-pdf/routes/index.routes')(app);

const APP_PORT = process.env.IGC_APP_PORT || 3000;

// Create a PDF with Password
app.post('/v1/docs/pdf/security', async function (req, res) {
    try {
        const { paths, filename, url, password } = req.body;
        var filePath = path.join(__dirname, 'docs/' + paths);
        var fileNameStore = Date.now() + '-' + filename;
        var fileNameTemp = 'tmp_' + fileNameStore;
        mkdirp.sync(`docs/${paths}/`)
        let options = {
            format: 'A4',
            scale: 1,
            path: filePath + '/' + fileNameTemp
        };
        let file = { url: url };
        html_to_pdf.generatePdf(file, options).then(async (pdfBuffer) => {
            var optionsEncrypt = {
                keyLength: 256,
                password: password,
                outputFile: filePath + '/' + fileNameStore,
                restrictions: {
                    modify: 'none',
                    extract: 'n'
                }
            }
            await qpdf.encrypt(filePath + '/' + fileNameTemp, optionsEncrypt);
            res.status(201).send({
                status: true,
                data: {
                    path: '/v1/docs/pdf/view/' + (Buffer.from(paths).toString('base64').replace('=', '')) + '/' + fileNameStore
                }
            })
        }).catch(error => {
            res.status(400).send({
                status: false,
                error: error.message
            })
        })
    } catch (error) {
        res.status(500).send({
            status: false,
            error: error.message
        })
    }
});

// Create a PDF General
app.post('/v1/docs/pdf/general', async function (req, res) {
    try {
        const { paths, filename, url } = req.body;
        var filePath = path.join(__dirname, 'docs/' + paths);
        var fileNameStore = Date.now() + '-' + filename;
        mkdirp.sync(`docs/${paths}/`)
        let options = {
            format: 'A4',
            scale: 1,
            path: filePath + '/' + fileNameStore
        };
        let file = { url: url };
        html_to_pdf.generatePdf(file, options).then(async (pdfBuffer) => {
            res.status(201).send({
                status: true,
                data: {
                    path: '/v1/docs/pdf/view/' + (Buffer.from(paths).toString('base64').replace('=', '')) + '/' + fileNameStore
                }
            })
        }).catch(error => {
            res.status(400).send({
                status: false,
                error: error.message
            })
        })
    } catch (error) {
        res.status(500).send({
            status: false,
            error: error.message
        })
    }
});

// View a PDF with Password
app.get('/v1/docs/pdf/view/:paths/:filename', async function (req, res) {
    try {
        const { paths, filename } = req.params;
        let pathsString = Buffer.from(paths, 'base64').toString('utf-8')
        var filePath = path.join(__dirname, 'docs/' + pathsString);
        var fileName = filename;
        fs.readFile(filePath + '/' + fileName, function (err, data) {
            if (error) {
                if (error.code == 'ENOENT') {
                    res.writeHead(404);
                    res.end();
                } else {
                    res.writeHead(500);
                    res.end();
                }
            } else {
                res.contentType("application/pdf");
                res.send(data);
            }
        });

    } catch (error) {
        res.status(500).send({
            status: false,
            error: error.message
        })
    }
});

// View a PDF Page
app.get('/v1/docs/pdf/page/:pdf_id/:data_id/:filename', async function (req, res) {
    try {
        let { pdf_id, data_id, filename } = req.params;

        let options = {
            format: 'A4',
            scale: 1
        };
        let file = { url: pdfConfig.URL_GENERATE + '/page/index.html?pdf_id=' + pdf_id + '&data_id=' + data_id + '&access_token=' + authConfig.EMPLOYEE_ADMIN_PASSWORD };
        html_to_pdf.generatePdf(file, options).then(async (pdfBuffer) => {
            res.contentType("application/pdf");
            res.send(pdfBuffer);
            res.end();
        }).catch(error => {
            res.writeHead(500);
            res.end();
        })
    } catch (error) {
        res.status(500).send({
            message: "เกิดข้อผิดพลาดบางประการ",
            code: 500,
        });
    }
});

// View a PDF Table
app.get('/v1/docs/pdf/table/:pdf_id/:data_id/:filename', async function (req, res) {
    try {
        let { pdf_id, data_id } = req.params;
        let options = {
            format: 'A4',
            scale: 1
        };
        let file = { url: pdfConfig.URL_GENERATE + '/table/index.html?pdf_id=' + pdf_id + '&data_id=' + data_id + '&access_token=' + authConfig.EMPLOYEE_ADMIN_PASSWORD };
        html_to_pdf.generatePdf(file, options).then(async (pdfBuffer) => {
            res.contentType("application/pdf");
            res.send(pdfBuffer);
        }).catch(error => {
            res.send({ error: error.message })
        })
    } catch (error) {
        res.status(500).send({
            message: "เกิดข้อผิดพลาดบางประการ",
            code: 500,
            error: `Error Getting form: ${error.message}`
        });
    }
});

function startup() {
    app.listen(APP_PORT, () => {
        console.log('server upload version 1.2 : ', APP_PORT)
    })
}
