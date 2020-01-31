const express = require("express");
const member = require("../controllers/member");
const router = express.Router();

router.post("", member.create);
router.get("/log", member.log);
router.get("/find-one", member.findOne);
router.get("/all", member.all);
router.put("/:id", member.update);
router.get("/:id", member.findById);
router.get("/password-reset-id/:id", member.findByPasswordResetId);

module.exports = router;
