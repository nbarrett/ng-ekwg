const express = require("express");
const walksAndEventsManager = require("./walks-and-events-manager");
const ramblersWalkUpload = require('./ramblers-walk-upload');

const memberBulkLoad = require('./member-bulk-load');
const config = require('../config/config');
const multer = require('multer');

const router = express.Router();

router.get('/gwem/walk-base-url', walksAndEventsManager.walkBaseUrl);
router.get('/gwem/walk-description-prefix', walksAndEventsManager.walkDescriptionPrefix);
router.get('/gwem/list-walks', walksAndEventsManager.listWalks);
router.post('/gwem/upload-walks', ramblersWalkUpload.uploadWalks);
router.post('/monthly-reports/upload', multer({dest: config.server.uploadDir}).any(), memberBulkLoad.uploadRamblersData);

module.exports = router;
