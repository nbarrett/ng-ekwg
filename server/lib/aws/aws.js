const express = require("express");
const controllers = require("./aws-controllers");
const {envConfig} = require("../env-config/env-config");
const fileUpload = require("./file-upload");
const authConfig = require("../auth/auth-config");
const multer = require("multer");
const router = express.Router();

router.post("/s3/file-upload", authConfig.authenticate(), multer({dest: envConfig.server.uploadDir}).any(), fileUpload.uploadFile);
router.get("/list-buckets", controllers.listBuckets);
router.get("/metadata/list-objects/:prefix", controllers.listObjects);
router.get("/s3/:bucket*", controllers.getObject);
router.get("/url-to-file", controllers.urlToFile);

module.exports = router;
