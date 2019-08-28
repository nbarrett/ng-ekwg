const express = require("express");
const controllers = require("./aws-controllers");
const config = require("../config/config");
const multer = require("multer");

const router = express.Router();


router.get("/list-buckets", controllers.listBuckets);
router.get("/s3/policy", controllers.s3Policy);
router.get("/config", controllers.getConfig);
router.get("/s3/:bucket*", controllers.get);
router.post("/s3/:key/:file", multer({dest: config.server.uploadDir}).any(), controllers.putObject);

module.exports = router;
