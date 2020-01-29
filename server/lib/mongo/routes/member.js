const express = require("express");
const member = require("../controllers/member");
const router = express.Router();

router.post("", member.create);
router.get("/log", member.log);
router.put("/:id", member.update);
router.get("/:id", member.findById);

module.exports = router;
