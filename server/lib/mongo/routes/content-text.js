const passport = require("passport");
const express = require("express");
const controller = require("../controllers/content-text");
const checkAuth = require("../../middleware/check-auth");
const router = express.Router();

router.post("", passport.authenticate("jwt"), controller.create);
router.put("/:id", passport.authenticate("jwt"), controller.update);
router.get("", controller.all);
router.get("/category/:category", controller.findByCategory);
router.get("/name/:name", controller.findByName);
router.get("/:id", controller.findById);
router.delete("/:id", checkAuth, passport.authenticate("jwt"), controller.delete);

module.exports = router;
