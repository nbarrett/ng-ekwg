import express = require("express");
import * as walksAndEventsManager from "./walks-and-events-manager";
import * as ramblersWalkUpload from "./ramblers-walk-upload";
import * as memberBulkLoad from "./member-bulk-load";
import * as authConfig from "../auth/auth-config";
import { envConfig } from "../env-config/env-config";
import multer = require("multer");
const router = express.Router();

router.get("/walks-manager/list-walks", walksAndEventsManager.listWalks);
router.post("/walks-manager/upload-walks", authConfig.authenticate(), ramblersWalkUpload.uploadWalks);
router.post("/monthly-reports/upload", authConfig.authenticate(), multer({dest: envConfig.server.uploadDir}).any(), memberBulkLoad.uploadRamblersData);

export const ramblers = router;
