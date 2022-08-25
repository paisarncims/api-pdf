const Router = require('express-promise-router');
const documentController = require('../controllers/document.controller');

const router = new Router();
router.get('/authorize/:config_id', documentController.authorize);
router.get('/verify/:config_id/token', documentController.verify);
router.get('/refresh/:config_id', documentController.refresh);
router.get('/verifycheck/:config_id', documentController.verifycheck);
router.post('/file/:config_id', documentController.create);
router.get('/file/:fileid', documentController.view);
router.get('/image/:size/:key', documentController.image);

module.exports = router;