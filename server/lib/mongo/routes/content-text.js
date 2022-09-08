const express = require("express");
const controller = require("../controllers/content-text");
const authConfig = require("../../auth/auth-config");
const router = express.Router();

router.post("", authConfig.authenticate(), controller.create);
router.put("/:id", authConfig.authenticate(), controller.update);
router.get("/:id", controller.findById);
router.get("/all", authConfig.authenticate(), controller.all);
router.get("", controller.findByConditions);
router.delete("/:id", authConfig.authenticate(), controller.delete);

module.exports = router;
