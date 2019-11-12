const express = require("express");
const authConfig = require("../../auth/auth-config");
const ramblersUploadAudit = require("../models/ramblers-upload-audit");
const controller = require("./../controllers/crud-controller").create(ramblersUploadAudit);

const router = express.Router();

router.post("", authConfig.authenticate(), controller.create);
router.get("", controller.findByConditions);
router.get("/all", authConfig.authenticate(), controller.all);
router.delete("/:id", authConfig.authenticate(), controller.delete);

module.exports = router;
