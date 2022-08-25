const pdfRoute = require('./pdf.routes');
const documentRoute = require('./document.routes');

module.exports = app => {
    app.use('/', pdfRoute);
    app.use('/v1/document', documentRoute);
}
