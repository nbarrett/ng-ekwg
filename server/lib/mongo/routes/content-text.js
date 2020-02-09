const express = require("express");
const controller = require("../controllers/content-text");
const authConfig = require("../../auth/auth-config");
const router = express.Router();

router.post("", authConfig.authenticate(), controller.create);
router.put("/:id", authConfig.authenticate(), controller.update);
router.get("", controller.all);
router.get("/category/:category", controller.findByCategory);
router.get("/name/:name", controller.findByName);
router.get("/:id", controller.findById);
router.delete("/:id", authConfig.authenticate(), controller.delete);

module.exports = router;
