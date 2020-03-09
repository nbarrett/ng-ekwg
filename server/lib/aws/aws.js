const express = require("express");
const controllers = require("./aws-controllers");
const config = require("../config/config");
const fileUpload = require("./file-upload");
const authConfig = require("../auth/auth-config");
const multer = require("multer");
const router = express.Router();

router.post("/s3/file-upload", authConfig.authenticate(), multer({dest: config.server.uploadDir}).any(), fileUpload.uploadFile);
router.get("/list-buckets", controllers.listBuckets);
router.get("/s3/policy", controllers.s3Policy);
router.get("/config", controllers.getConfig);
router.get("/s3/:bucket*", controllers.get);


module.exports = router;
