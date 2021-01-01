const express = require("express");
const walksAndEventsManager = require("./walks-and-events-manager");
const ramblersWalkUpload = require("./ramblers-walk-upload");
const memberBulkLoad = require("./member-bulk-load");
const authConfig = require("../auth/auth-config");
const {envConfig} = require("../env-config/env-config");
const multer = require("multer");
const router = express.Router();

router.get("/gwem/walk-base-url", walksAndEventsManager.walkBaseUrl);
router.get("/gwem/list-walks", walksAndEventsManager.listWalks);
router.post("/gwem/upload-walks", authConfig.authenticate(), ramblersWalkUpload.uploadWalks);
router.post("/monthly-reports/upload", authConfig.authenticate(), multer({dest: envConfig.server.uploadDir}).any(), memberBulkLoad.uploadRamblersData);
module.exports = router;
