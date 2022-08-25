const Router = require('express-promise-router');

const authEmployee = require('../../src/middlewares/employee.middleware');
const pdfController = require('../controllers/pdf.controller');

const router = new Router();
router.post('/docs/create', pdfController.create);
router.get('/docs/:pdf_id/:data_id/:filename', pdfController.page);

module.exports = router;