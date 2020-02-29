"use strict";
const config = require("../config/config.js");
const debug = require("debug")(config.logNamespace("template-migrator"));
let fs = require("fs");

exports.migrateTemplate = (req, res) => {
  const path = req.path;
  const fileName = `../${req.query.file}`;
  debug("migrateTemplate:file", fileName);
  const response = {response: path, url: req.url, file: fileName};
  if (fs.existsSync(fileName)) {
    res.json(response)
  } else {
    response.error = fileName + " does not exist"
    res.json(response)
  }

  // if (!fs.existsSync(path)) {
  //   fs.mkdirSync(path);
  // }
  // fs.writeFile(filePath, csv, function (error) {
  //   if (error) throw error;
  //   debug("file", filePath, "saved");
  //   process.env["RAMBLERS_USER"] = req.body.ramblersUser;
  //   process.env["RAMBLERS_DELETE_WALKS"] = req.body.deleteWalks.join(",");
  //   process.env["RAMBLERS_FILENAME"] = filePath;
  //   process.env["RAMBLERS_WALKCOUNT"] = req.body.rows.length;
  //   process.env["RAMBLERS_FEATURE"] = "walks-upload.ts";
  //   const spawn = require("child_process").spawn;
  //   debug("running feature", process.env["RAMBLERS_FEATURE"]);
  //   const subprocess = spawn("npm", ["run", "e2e"], {
  //     detached: true,
  //     stdio: ["pipe"],
  //   });

}
