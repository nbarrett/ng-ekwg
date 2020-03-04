const express = require("express");
const authConfig = require("../../auth/auth-config");
const expenseClaim = require("../models/expense-claim");
const controller = require("./../controllers/crud-controller").create(expenseClaim);

const router = express.Router();

router.post("", authConfig.authenticate(), controller.create);
router.get("", controller.findByConditions);
router.get("/all", authConfig.authenticate(), controller.all);
router.get("/:id", controller.findById);
router.delete("/:id", authConfig.authenticate(), controller.delete);

module.exports = router;
