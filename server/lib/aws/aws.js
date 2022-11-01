const express = require("express");
const controllers = require("./aws-controllers");
const {envConfig} = require("../env-config/env-config");
const fileUpload = require("./file-upload");
const authConfig = require("../auth/auth-config");
const multer = require("multer");
const router = express.Router();

router.post("/s3/file-upload", authConfig.authenticate(), multer({dest: envConfig.server.uploadDir}).any(), fileUpload.uploadFile);
router.get("/list-buckets", controllers.listBuckets);
router.get("/s3/policy", controllers.s3Policy);
router.get("/config", controllers.getConfig);
router.get("/metadata/list-objects/:prefix", controllers.listObjects);
router.get("/s3/:bucket*", controllers.getObject);
router.get("/url-to-file", controllers.urlToFile);
router.get("/s3/object/:bucket*", controllers.getObjectAsBase64);


module.exports = router;
