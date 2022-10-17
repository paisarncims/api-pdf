const PdfTokenSchema = require('../models/pdf-token.models')
const PdfConfigSchema = require('../models/pdf-config.models')
const { google } = require('googleapis');
const gdoctableapp = require('gdoctableapp')
const urlConfig = require('../config/url.config.json');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { default: axios } = require('axios')


exports.authorize = async (req, res, next) => {
    try {
        var { config_id } = req.params;
        var pdfConfig = await PdfConfigSchema.findOne({ script_class: config_id, script_status: true });
        const oAuth2Client = new google.auth.OAuth2(
            pdfConfig.client_id,
            pdfConfig.client_secret,
            urlConfig.REDIRECT_URI + '/' + config_id + '/token'
        );
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: urlConfig.SCOPES,
            prompt: 'consent',
            login_hint: '',
        });
        res.set('Cache-Control', 'private, max-age=0, s-maxage=0');
        res.redirect(authUrl);
    } catch (error) {
        res.status(400).json({
            status: false,
            message: 'พบข้อผิดพลาดบางประการ',
            error: error.message
        })
    }
}

exports.verify = async (req, res, next) => {
    try {
        var { config_id } = req.params;
        var { code } = req.query;
        var pdfConfig = await PdfConfigSchema.findOne({ script_class: config_id, script_status: true });

        const oAuth2Client = new google.auth.OAuth2(
            pdfConfig.client_id,
            pdfConfig.client_secret,
            urlConfig.REDIRECT_URI + '/' + config_id + '/token'
        );
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        const oauth2 = google.oauth2({
            auth: oAuth2Client,
            version: 'v2',
        });
        const { data } = await oauth2.userinfo.get();
        const { id, email } = data;
        var pdfTokenSchema = await PdfTokenSchema.findOne({ config_id })
        if (pdfTokenSchema) {
            await PdfTokenSchema.updateOne({ config_id }, { tokens: tokens, id, email })
        } else {
            await PdfTokenSchema.create({ id, email, config_id, tokens: tokens })
        }

        res.set('Cache-Control', 'private, max-age=0, s-maxage=0');
        res.send(`User ${email} is authorized! ${id}`);

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'พบข้อผิดพลาดบางประการ',
            error: error.message
        })
    }
}

exports.verifycheck = async (req, res, next) => {
    try {
        var { config_id } = req.params;
        var pdfTokenSchema = await PdfTokenSchema.findOne({ config_id })

        res.status(200).json({
            status: true,
            data: pdfTokenSchema
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'พบข้อผิดพลาดบางประการ',
            error: error.message
        })
    }
}


exports.refresh = async (req, res, next) => {
    try {
        var { config_id } = req.params;
        var pdfConfig = await PdfConfigSchema.findOne({ script_class: config_id, script_status: true });

        var pdfTokenSchema = await PdfTokenSchema.findOne({ config_id })
        if (pdfTokenSchema) {
            const oAuth2Client = new google.auth.OAuth2(
                pdfConfig.client_id,
                pdfConfig.client_secret,
                urlConfig.REDIRECT_URI + '/' + config_id + '/token'
            );
            oAuth2Client.setCredentials(PdfTokenSchema.tokens);
            var data = await oAuth2Client.refreshAccessToken();
            await PdfTokenSchema.updateOne({ config_id }, { tokens: data.credentials })
            res.status(200).send({ credentials: data.credentials });
        } else {
            res.status(404).json({
                status: false,
                message: 'ไม่พบข้อมูล'
            })
        }

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'พบข้อผิดพลาดบางประการ',
            error: error.message
        })
    }
}


function tableAppendRow(resource) {
    return new Promise((resove, reject) => {
        gdoctableapp.AppendRow(resource, function (err, response) {
            if (err) {
                reject(err)
            } else {
                resove(response)
            }
        });
    })
}

function tableDeleteRowsAndColumns(resource) {
    return new Promise((resove, reject) => {
        gdoctableapp.DeleteRowsAndColumns(resource, function (err, response) {
            if (err) {
                reject(err)
            } else {
                resove(response)
            }
        });
    })
}
function findObject(elements, objectId, startIndex) {
    var objects = []
    for(var i = 0; i<elements.length ; i++) {
        if(elements[i].inlineObjectElement) {
            if(elements[i].inlineObjectElement.inlineObjectId == objectId) {
                var result = {
                    startIndex: startIndex,
                    object: elements[i]
                }
                objects.push(result)
            }
        } else if(elements[i] && elements[i].paragraph && elements[i].paragraph.elements) {
            var result = findObject(elements[i].paragraph.elements, objectId, elements[i].startIndex)
            if(result.length) {
                objects = [...objects, ...result]
            }
        }
    }
    return objects
}
exports.create = async (req, res, next) => {
    try {
        var { config_id } = req.params;
        var table = [];
        var replaceTexts = {};
        var pdfConfig = await PdfConfigSchema.findOne({ script_class: config_id, script_status: true });
        var pdfToken = await PdfTokenSchema.findOne({ config_id });
        
        if (pdfToken) {
            const { document_api_url, document_data_id } = pdfConfig;
            // Set Data from API
            if(document_api_url) {
                var response = null;
                try {
                    if(document_data_id) {
                        response = await axios.get(document_api_url.replace('{{' + document_data_id + '}}', req.body[document_data_id])).then(res=>res.data.data)
                    } else {
                        response = await axios.get(document_api_url).then(res=>res.data.data)
                    }
                } catch (error) {
                    console.log(error.message)
                }
                if(response) {
                    if(response.table) {
                        table = response.table;
                    }
                    if(response.replaceTexts) {
                        replaceTexts = response.replaceTexts;
                    }
                }
            }
            const oAuth2Client = new google.auth.OAuth2(
                pdfConfig.client_id,
                pdfConfig.client_secret,
                urlConfig.REDIRECT_URI + '/' + config_id + '/token'
            );
            oAuth2Client.setCredentials(pdfToken.tokens);
            const drive = google.drive({ version: 'v2', auth: oAuth2Client });
            var copyResult = await drive.files.copy({
                fileId: pdfConfig.document_id,
                requestBody: {
                    title: pdfConfig.document_template_name + '_' + Date.now(),
                    parents: [pdfConfig.document_folder_id]
                }
            })
            var documentId = copyResult.data.id;
            const docs = google.docs({ version: 'v1', auth: oAuth2Client });
            var newFile = await docs.documents.get({
                documentId: documentId
            });
            var content = newFile.data.body.content;
            var requests = []
            var images = []
            if(newFile.data.inlineObjects) {
                var inlineObjects = newFile.data.inlineObjects;
                for(var i in inlineObjects) {
                    try {
                        var objectId = inlineObjects[i].objectId
                        var sourceUri = inlineObjects[i].inlineObjectProperties.embeddedObject.imageProperties.sourceUri
                        if( sourceUri.includes(urlConfig.ENDPOINT_URI) ) {
                            var sourceUris = sourceUri.split('/');
                            var key = sourceUris[sourceUris.length - 1];
                            images.push({
                                objectId: objectId,
                                key: key,
                                embeddedObject: inlineObjects[i].inlineObjectProperties.embeddedObject
                            })
                        }
                    } catch (error) { }
                }
            }
            for(var i = 0; i<images.length;i++) {
                var imageInsertResult = findObject(content, images[i].objectId, 1)
                for(var j = 0; j<imageInsertResult.length;j++) {
                    var startIndexDelete = imageInsertResult[j].object.startIndex;
                    var endIndexDelete = imageInsertResult[j].object.endIndex;
                    var startIndexInsert = imageInsertResult[j].startIndex
                    var objectSize = images[i].embeddedObject.size

                    if(replaceTexts[images[i].key]) {
                        requests.push({
                            deleteContentRange: {
                                range: {
                                    startIndex: startIndexDelete,
                                    endIndex: endIndexDelete
                                }
                
                            }
                        })
                        requests.push({
                            insertInlineImage: {
                                location: { index: startIndexDelete },
                                uri: replaceTexts[images[i].key],
                                objectSize: objectSize
                            }
                        })
                    }
                    
                }
            }
            for(var i in replaceTexts) {
                requests.push({
                    'replaceAllText': {
                        'containsText': {
                            'text': '{{' + i + '}}',
                            'matchCase':  'true'
                        },
                        'replaceText': (replaceTexts[i]),
                    }
                })
            }
            if(requests.length) {
                await docs.documents.batchUpdate({
                    documentId: documentId,
                    requestBody: {
                        requests: requests
                    }
                })
            }
            

            var keys = []
            for (var i = 0; i < content.length; i++) {
                if (content[i].table) {
                    keys = content[i].table.tableRows[1].tableCells.map(item => {
                        try {
                            return item.content[0].paragraph.elements[0].textRun.content.replace("\n", '')
                        } catch (error) {
                            return null
                        }
                    });
                }
            }
            var values = table.map((item) => {
                var new_item = []
                for (var x = 0; x < keys.length; x++) {
                    var key = null;
                    for (var k in item) {
                        if (("{{" + k + "}}") == keys[x]) {
                            key = k;
                        }
                    }
                    if (key) {
                        new_item.push(item[key])
                    } else {
                        new_item.push("-")
                    }
                }
                return new_item;
            })
            if(values.length) {
                await tableAppendRow({
                    auth: oAuth2Client,
                    documentId: documentId,
                    tableIndex: 0,
                    values: values
                });
                await tableDeleteRowsAndColumns({
                    auth: oAuth2Client,
                    documentId: documentId,
                    tableIndex: 0,
                    deleteRows: [1]
                })    
            }
            
            res.status(201).json({
                status: true,
                data: {
                    fileid: Buffer.from(documentId + ':' + config_id).toString('base64'),
                    enpoint: urlConfig.ENDPOINT_URI + '/file',
                }
            })
        } else {
            res.status(404).json({
                status: false,
                message: 'ไม่พบข้อมูล'
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'พบข้อผิดพลาดบางประการ',
            error: error.message
        })
    }
}

exports.view = async (req, res, next) => {
    try {
        var { fileid } = req.params;
        var d = Buffer.from(fileid, 'base64').toString('ascii');
        var ds = d.split(':');
        var documentId = ds[0];
        var config_id = ds[1];
        var pdfConfig = await PdfConfigSchema.findOne({ script_class: config_id, script_status: true });
        var pdfTokenSchema = await PdfTokenSchema.findOne({ config_id });

        console.log('pdfConfig : ', pdfConfig);
        if (pdfTokenSchema) {
            const oAuth2Client = new google.auth.OAuth2(
                pdfConfig.client_id,
                pdfConfig.client_secret,
                urlConfig.REDIRECT_URI + '/' + config_id + '/token'
            );
            oAuth2Client.setCredentials(pdfTokenSchema.tokens);
            const drive = google.drive({ version: 'v2', auth: oAuth2Client });
            var result = await drive.files.export({
                fileId: documentId,
                mimeType: 'application/pdf'
            }, {
                responseType: "arraybuffer"
            })
            var file = await Buffer.from(result.data);
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-Disposition', 'inline;filename=yolo.pdf')
            res.send(file)
        } else {
            res.status(404).json({
                status: false,
                message: 'ไม่พบข้อมูล'
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'พบข้อผิดพลาดบางประการ',
            error: error.message
        })
    }
}


function resize(path, format, width, height) {
    const readStream = fs.createReadStream(path)
    let transform = sharp()

    if (format) {
        transform = transform.toFormat(format)
    }
    if (width || height) {
        transform = transform.resize(width, height)
    }
   
    return readStream.pipe(transform)
}

exports.image = async (req, res, next) => {
    try {
        const { size, key } = req.params;
        var ss = size.split('x');
        var width = parseInt(ss[0])
        var height = parseInt(ss[1])
        res.type('image/png')
        resize(path.join(__dirname, 'images/image.png'), 'png', width, height).pipe(res);
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'พบข้อผิดพลาดบางประการ',
            error: error.message
        })
    }
}