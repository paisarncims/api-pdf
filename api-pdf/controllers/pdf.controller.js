const fs = require('fs');
const html_to_pdf = require('html-pdf-node');
const ejs = require('ejs');
const authConfig = require('../../src/config/auth.config');
const { default: axios } = require('axios');
const pdfConfig = require('../../src/config/pdf.config');
const qpdf = require('node-qpdf');
const FormData = require('form-data')
const moment = require('moment')

function unlinkFile(_path) {
    return new Promise((resolve, reject)=>{
        fs.unlink(_path, (err)=>{
            resolve()
        })
    })
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function thaiNumber(num){
    try {
        var array = {"1":"๑", "2":"๒", "3":"๓", "4" : "๔", "5" : "๕", "6" : "๖", "7" : "๗", "8" : "๘", "9" : "๙", "0" : "๐"};
    var str = num.toString();
    for (var val in array) {
    str = str.split(val).join(array[val]);
    }
    return str;
    } catch (error) {
        return '-'
    }
}

function ThaiBaht(number) {
    try {
        if (number) {
            //ตัดสิ่งที่ไม่ต้องการทิ้งลงโถส้วม
            for (var i = 0; i < number.length; i++) {
                number = number.replace(",", ""); //ไม่ต้องการเครื่องหมายคอมมาร์
                number = number.replace(" ", ""); //ไม่ต้องการช่องว่าง
                number = number.replace("บาท", ""); //ไม่ต้องการตัวหนังสือ บาท
                number = number.replace("฿", ""); //ไม่ต้องการสัญลักษณ์สกุลเงินบาท
            }
            console.log(number)
            //สร้างอะเรย์เก็บค่าที่ต้องการใช้เอาไว้
            var TxtNumArr = new Array("ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า", "สิบ");
            var TxtDigitArr = new Array("", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน");
            var BahtText = "";
            //ตรวจสอบดูซะหน่อยว่าใช่ตัวเลขที่ถูกต้องหรือเปล่า ด้วย isNaN == true ถ้าเป็นข้อความ == false ถ้าเป็นตัวเลข
            if (isNaN(number)) {
                return "ข้อมูลนำเข้าไม่ถูกต้อง";
            } else {
                //ตรวสอบอีกสักครั้งว่าตัวเลขมากเกินความต้องการหรือเปล่า
                if ((number - 0) > 9999999.9999) {
                    return "ข้อมูลนำเข้าเกินขอบเขตที่ตั้งไว้";
                } else {
                    //พรากทศนิยม กับจำนวนเต็มออกจากกัน (บาปหรือเปล่าหนอเรา พรากคู่เขา)
                    if(!number.includes('.')) {
                        number = number + '.00'
                    }
                    number = number.split(".");
                    //ขั้นตอนต่อไปนี้เป็นการประมวลผลดูกันเอาเองครับ แบบว่าขี้เกียจจะจิ้มดีดแล้ว อิอิอิ
                    if (number[1].length > 0) {
                        number[1] = number[1].substring(0, 2);
                    }
                    var numberLen = number[0].length - 0;
                    for (var i = 0; i < numberLen; i++) {
                        var tmp = number[0].substring(i, i + 1) - 0;
                        if (tmp != 0) {
                            if ((i == (numberLen - 1)) && (tmp == 1)) {
                                BahtText += "เอ็ด";
                            } else
                                if ((i == (numberLen - 2)) && (tmp == 2)) {
                                    BahtText += "ยี่";
                                } else
                                    if ((i == (numberLen - 2)) && (tmp == 1)) {
                                        BahtText += "";
                                    } else {
                                        BahtText += TxtNumArr[tmp];
                                    }
                            BahtText += TxtDigitArr[numberLen - i - 1];
                        }
                    }
                    BahtText += "บาท";
                    if ((number[1] == "0") || (number[1] == "00")) {
                        BahtText += "ถ้วน";
                    } else {
                        DecimalLen = number[1].length - 0;
                        for (var i = 0; i < DecimalLen; i++) {
                            var tmp = number[1].substring(i, i + 1) - 0;
                            if (tmp != 0) {
                                if ((i == (DecimalLen - 1)) && (tmp == 1)) {
                                    BahtText += "เอ็ด";
                                } else
                                    if ((i == (DecimalLen - 2)) && (tmp == 2)) {
                                        BahtText += "ยี่";
                                    } else
                                        if ((i == (DecimalLen - 2)) && (tmp == 1)) {
                                            BahtText += "";
                                        } else {
                                            BahtText += TxtNumArr[tmp];
                                        }
                                BahtText += TxtDigitArr[DecimalLen - i - 1];
                            }
                        }
                        BahtText += "สตางค์";
                    }
                    return BahtText;
                }
            }
        } else {
            return '-'
        }
    } catch (error) {
        return '-'
    }
}

exports.page = async (req, res, next) => {
    try {
        const { pdf_id, data_id, filename } = req.params;
        let options = {
            height: '297mm',
            width: '210mm',
            path: __dirname + '/temp/' + filename
        };

        const headers = {
            'headers': {
                'Authorization': 'Bearer ' + authConfig.EMPLOYEE_ADMIN_PASSWORD
            }
        }
        var pdf_response = await axios.get(pdfConfig.API_SERVICE + '/v1/pdf/innerpage?ScriptStatus=true&SortKey=createdAt&ScriptPdfId=' + pdf_id, headers)
        var pdf_result = pdf_response.data;
        var pdf_data = pdf_result.data;
       
        var template = '';
        var data = {
            getImagePath: function(url) {
                if(url) {
                    if(typeof url == 'string' && url.includes('https')) {
                        return url;
                    } else {
                        return pdfConfig.API_STORAGE + url + '?access_token=' + authConfig.EMPLOYEE_ADMIN_PASSWORD;
                    }
                } else {
                    return ''
                }
            },
            textFormat: function(texttype, value) {
                if(value == undefined) {
                    return '-'
                }
                if (texttype == 'number') {
                    return numberWithCommas(value)
                } if (texttype == 'number2') {
                    return thaiNumber(value)
                } if (texttype == 'number3') {
                    return ThaiBaht(value)
                } else if (texttype == 'date') {
                    return moment(value).format('DD.MM.YYYY X')
                } else if (texttype == 'date1') {
                    return moment(value).format('D MMMM YYYY')
                } else if (texttype == 'date2') {
                    return moment(value).format('D MMMM YYYY HH:mmน.')
                } else if (texttype == 'date3') {
                    return moment(value).format('D MMM YY')
                } else if (texttype == 'date4') {
                    return moment(value).format('D MMM YY HH:mmน.')
                } else if (texttype == 'date5') {
                    return moment(value).format('D/MM/YYYY')
                } else if (texttype == 'date6') {
                    return moment(value).format('D/MM/YYYY HH:mmน.')
                } else {
                    return value
                }
            }
        }
        for(var i=0;i<pdf_data.length;i++) {
            template = template + pdf_data[i].ScriptTemplatePage;
            var config = JSON.parse(pdf_data[i].Script);
            var api = config.data_api.replace('{{id}}', data_id);
            var page_response = null;
            var page_data = {};
            var background_url = pdf_data[i].ScriptBackgroundUrl;
            try {
                page_response = await axios.get(api, headers);
                page_data = page_response.data.data;
            } catch (error) {
                page_response = null;
            }
            data["DRM_" + pdf_data[i]._id] = page_data;
            if(background_url) {
                data["DRM_" + pdf_data[i]._id].background_image = background_url;
            }
        }
        template = pdfConfig.getTmeplate(template);
        let html = ejs.render(template, data);
        let file = { content: html };
        html_to_pdf.generatePdf(file, options).then(async (pdfBuffer) => {
            res.sendFile(__dirname + "/temp/" + filename, function (err) {
                unlinkFile(__dirname + "/temp/" + filename)
            })
        }).catch(error => {
            res.json({ error: error.message })
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'พบข้อผิดพลาดบางประการ',
            error: error.message
        })
    }
}

exports.create = async (req, res, next) => {
    try {
        var { pdf_id, data_id, filename, password, bucket, private } = req.body;

        var _name = Date.now() + '_' + filename;
        var _temp =  __dirname + '/temp/';
        var _tempOutput =  __dirname + '/temp-output/';

        if(!password) {
            _temp = _tempOutput;
        }

        let options = {
            height: '297mm',
            width: '210mm',
            path: _temp + _name
        };
        const headers = {
            'headers': {
                'Authorization': 'Bearer ' + authConfig.EMPLOYEE_ADMIN_PASSWORD
            }
        }
        var pdf_response = await axios.get(pdfConfig.API_SERVICE + '/v1/pdf/innerpage?ScriptStatus=true&SortKey=createdAt&ScriptPdfId=' + pdf_id, headers);
        var pdf_result = pdf_response.data;
        var pdf_data = pdf_result.data;
       
        var template = '';
        var data = {
            getImagePath: function(url) {
                if(url) {
                    if(typeof url == 'string' && url.includes('https')) {
                        return url;
                    } else {
                        return pdfConfig.API_STORAGE + url + '?access_token=' + authConfig.EMPLOYEE_ADMIN_PASSWORD;
                    }
                } else {
                    return ''
                }
            },
            textFormat: function(texttype, value) {
                if(value == undefined) {
                    return '-'
                }
                if (texttype == 'number') {
                    return numberWithCommas(value)
                } if (texttype == 'number2') {
                    return thaiNumber(value)
                } if (texttype == 'number3') {
                    return ThaiBaht(value)
                } else if (texttype == 'date') {
                    return moment(value).format('DD.MM.YYYY X')
                } else if (texttype == 'date1') {
                    return moment(value).format('D MMMM YYYY')
                } else if (texttype == 'date2') {
                    return moment(value).format('D MMMM YYYY HH:mmน.')
                } else if (texttype == 'date3') {
                    return moment(value).format('D MMM YY')
                } else if (texttype == 'date4') {
                    return moment(value).format('D MMM YY HH:mmน.')
                } else if (texttype == 'date5') {
                    return moment(value).format('D/MM/YYYY')
                } else if (texttype == 'date6') {
                    return moment(value).format('D/MM/YYYY HH:mmน.')
                } else {
                    return value
                }
            }
        }
        for(var i=0;i<pdf_data.length;i++) {
            template = template + pdf_data[i].ScriptTemplatePage;
            var config = JSON.parse(pdf_data[i].Script);
            var api = config.data_api.replace('{{id}}', data_id);
            var page_response = null;
            var page_data = {};
            var background_url = pdf_data[i].ScriptBackgroundUrl;
            try {
                page_response = await axios.get(api, headers);
                page_data = page_response.data.data;
            } catch (error) {
                page_response = null;
            }
            data["DRM_" + pdf_data[i]._id] = page_data;
            if(background_url) {
                data["DRM_" + pdf_data[i]._id].background_image = background_url;
            }
        }
        template = pdfConfig.getTmeplate(template);
        let html = ejs.render(template, data);
        let file = { content: html };
        html_to_pdf.generatePdf(file, options).then(async (pdfBuffer) => {
            if(password) {
                var optionsEncrypt = {
                    keyLength: 256,
                    password: password,
                    outputFile: _tempOutput + _name,
                    restrictions: {
                        modify: 'none',
                        extract: 'n'
                    }
                }
                await qpdf.encrypt(_temp + _name, optionsEncrypt);
            }
            const form = new FormData();
            form.append('file', fs.createReadStream(_tempOutput + _name));
            const requestConfig = {
                headers: {
                  'Authorization': `Bearer ${authConfig.EMPLOYEE_ADMIN_PASSWORD}`,
                  ...form.getHeaders()
                }
            };
            var resUpload = await axios.post(private ? pdfConfig.API_UPLOAD_PRIVATE : pdfConfig.API_UPLOAD_PUBLIC + '/' + bucket, form, requestConfig);
            await unlinkFile(_tempOutput + _name);
            await unlinkFile(_temp + _name);
            res.json({ 
                status: true,
                data: {
                    url: resUpload.data.data.url,
                    enpoint: pdfConfig.API_STORAGE
                }
            })
        }).catch(error => {
            res.json({ error: error.message })
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'พบข้อผิดพลาดบางประการ',
            error: error.message
        })
    }
}