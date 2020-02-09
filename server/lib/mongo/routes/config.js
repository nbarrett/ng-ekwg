const express = require("express");
const authConfig = require("../../auth/auth-config");
const config = require("../models/config");
const controller = require("./../controllers/crud-controller").create(config);

const router = express.Router();

router.post("", authConfig.authenticate(), controller.create);
router.get("", controller.findByConditions);
router.delete("/:id", authConfig.authenticate(), controller.delete);

module.exports = router;
