const express = require("express");
const passport = require("passport");
const controller = require("../controllers/auth");
const router = express.Router();

router.post("/log", controller.logMember);
router.post("/logout", controller.logout);
router.post("/create", controller.createMember);
router.post("/login", controller.login);
router.post("/audit-member-login", controller.auditMemberLogin);
router.post("/refresh", controller.refresh);
router.post("/example", passport.authenticate("jwt"), controller.example);

module.exports = router;
