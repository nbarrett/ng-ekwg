"use strict";
const {clone} = require("lodash");
const config = require("../config/config");
const stringUtils = require("../shared/string-utils");
const debug = require("debug")(config.logNamespace("template-migrator"));
let fs = require("fs");
const path = require("path");
const {resolve} = path;
const {readdir, stat} = fs.promises;

exports.migrateTemplate = (req, res) => {

  async function walkDir(dir, filter) {
    filter = filter || (() => true);
    let list = await readdir(dir);
    let results = await Promise.all(list.map(file => {
      file = resolve(dir, file);
      return stat(file).then(stat => {
        if (stat.isDirectory()) {
          return walkDir(file, filter);
        } else {
          return filter(file) ? file : "";
        }
      });
    }));
    return (await results.filter(f => !!f)).flat(2);
  }

  const tokenPairs = [
    ["ng-if", "*ngIf"],
    ["ng-disabled", "[disabled]"],
    ["ng-click", "(click)"],
    ["ng-hide", "!*ngIf"],
    ["ng-model", "[(ngModel)]"],
    ["ng-class", "[ngClass]"],
    ["ng-bind", "[textContent]"],
    ["ng-repeat", "*ngFor"],
    ["ng-change", "(ngModelChange)"],
    ["ng-href", "[href]"],
    ["ng-options", "<option *ngFor"],
    ["uib-", ""]];

  const requestPath = req.path;
  const fileName = `../${req.query.file}`;
  const sourceDir = path.normalize(`../${req.query.in}`);
  const migratedFileName = stringUtils.replaceAll("html", "ts", fileName);
  debug("input file", fileName);
  const response = {response: requestPath, in: sourceDir, out: req.query.out};
  if (req.query.in) {
    walkDir(sourceDir, (file) => file.endsWith(".html")).then(files => {
      debug("files", files);
      response.output = files.map(inputFile => {
        const directory = path.dirname(inputFile);
        const relativeDir = directory.split(req.query.in)[1];
        const output = path.join("../", req.query.out, relativeDir, "/", path.basename(inputFile));
        const outputFile = path.resolve(output);
        convert(inputFile, outputFile);
        return {
          relativeDir,
          inputFile,
          inExists: fs.existsSync(inputFile),
          outputFile,
          outExists: fs.existsSync(output)
        }
      })
      res.json(response)
    })
  } else {
    res.json({error: "no input parameter specified"})
  }

  function convert(inputFile, outputFile) {
    if (fs.existsSync(inputFile)) {
      const outputDir = path.basename(outputFile);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }
      const fileContents = fs.readFileSync(inputFile).toString();
      let outputContents = clone(fileContents);
      tokenPairs.forEach(pair => {
        debug("replacing tokens:", pair);
        outputContents = stringUtils.replaceAll(pair[0], pair[1], outputContents);
      })
      debug("outputContents file", migratedFileName);
      fs.writeFileSync(outputFile, outputContents);
      debug("outputContents", migratedFileName, "created")
    } else {
      debug("input", inputFile, "does not exist")
    }
  }

}
