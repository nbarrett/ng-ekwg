const express = require("express");
const controller = require("../controllers/content-text");
const checkAuth = require("../../middleware/check-auth");
const router = express.Router();

router.post("", controller.create);
router.put("/:id", controller.update);
router.get("", controller.all);
router.get("/category/:category", controller.findByCategory);
router.get("/name/:name", controller.findByName);
router.get("/:id", controller.findById);
router.delete("/:id", checkAuth, controller.delete);

module.exports = router;
