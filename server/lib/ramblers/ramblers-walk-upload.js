"use strict";
const config = require("../config/config.js");
const parser = require("./ramblers-audit-parser");
const debug = require("debug")(config.logNamespace("ramblers-walk-upload"));
const moment = require("moment-timezone");
const fs = require("fs");
const StringDecoder = require("string_decoder").StringDecoder;
const decoder = new StringDecoder("utf8");
const ramblersUploadAudit = require("../../lib/mongo/models/ramblers-upload-audit");
const json2csv = require("json2csv");
const mongooseClient = require("../mongo/mongoose-client");
const path = "/tmp/ramblers/";
exports.uploadWalks = (req, res) => {

  debug("request made with body:", req.body);
  const csvData = json2csv({data: req.body.rows, fields: req.body.headings});
  const fileName = req.body.fileName;
  const filePath = path + fileName;
  debug("csv data:", csvData, "filePath:", filePath);
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }

  fs.writeFileSync(filePath, csvData, error => {
    if (error) {
      res.status(500).send({
        responseData: [],
        error: error,
        information: "Ramblers walks upload failed via " + fileName
      });
    }
    debug("file", filePath, "saved");
  });

  const auditRamblersUpload = (auditMessage, parserFunction) => {
    parserFunction(auditMessage).forEach(message => {
      if (message.audit) {
        mongooseClient.create(ramblersUploadAudit, {
          auditTime: moment().tz("Europe/London").valueOf(),
          fileName: fileName,
          type: message.type,
          status: message.status,
          message: message.message,
        });
      }
    });
  };

  process.env["RAMBLERS_USER"] = req.body.ramblersUser;
  process.env["RAMBLERS_DELETE_WALKS"] = req.body.deleteWalks.join(",");
  process.env["RAMBLERS_FILENAME"] = filePath;
  process.env["RAMBLERS_WALKCOUNT"] = req.body.rows.length;
  process.env["RAMBLERS_FEATURE"] = req.body.feature || "walks-upload.ts";
  const spawn = require("child_process").spawn;
  debug("running feature", process.env["RAMBLERS_FEATURE"]);
  const subprocess = spawn("npm", ["run", "protractor"], {
    detached: true,
    stdio: ["pipe"],
  });

  subprocess.unref();
  subprocess.stdout.on("data", data => {
    auditRamblersUpload(decoder.write(data), parser.parseStandardOut);
  });
  subprocess.stderr.on("data", data => {
    auditRamblersUpload(decoder.write(data), parser.parseStandardError);
  });
  subprocess.on("exit", () => {
    auditRamblersUpload("Upload completed for " + fileName, parser.parseExit);
  });

  res.status(200).send({
    responseData: "Ramblers walks upload was successfully submitted via " + fileName
  });

};
