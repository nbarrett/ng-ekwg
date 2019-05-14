'use strict';
let config = require('../../config.js');
let parser = require('./ramblersAuditParser');
let debug = require('debug')(config.logNamespace('ramblers:uploadWalks'));
let path = require('path');
let moment = require('moment-timezone');
let fs = require('fs');
let _ = require('underscore');
var StringDecoder = require('string_decoder').StringDecoder;
let json2csv = require('json2csv');
let localMongo = require('../mongo/localMongo');

exports.uploadWalks = function (req, res) {
  let decoder = new StringDecoder('utf8');
  debug('request made with body', req.body);
  let csv = json2csv({data: req.body.rows, fields: req.body.headings});
  let path = '/tmp/ramblers/';
  let fileName = req.body.fileName;
  let filePath = path + fileName;

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }

  const auditRamblersUpload = function (auditMessage, error) {
    _.each(parser.parseMessagesFrom(auditMessage), function (message) {
      if (message.audit) {
        localMongo.post('ramblersUploadAudit', {
          auditTime: moment().tz('Europe/London').valueOf(),
          fileName: fileName,
          type: message.type,
          status: error ? 'error' : message.status,
          message: message.message
        });
      }
    });
  };

  fs.writeFile(filePath, csv, function (error) {
    if (error) throw error;
    debug('file', filePath, 'saved');
    process.env['RAMBLERS_USER'] = req.body.ramblersUser;
    process.env['RAMBLERS_DELETE_WALKS'] = req.body.deleteWalks.join(',');
    process.env['RAMBLERS_FILENAME'] = filePath;
    process.env['RAMBLERS_WALKCOUNT'] = req.body.rows.length;
    process.env['RAMBLERS_FEATURE'] = 'walks-upload.ts';
    const spawn = require('child_process').spawn;
    debug('running feature', process.env['RAMBLERS_FEATURE']);
    const subprocess = spawn('npm', ['run', 'e2e'], {
      detached: true,
      stdio: ['pipe']
    });

    subprocess.unref();
    subprocess.stdout.on('data', function (data) {
      auditRamblersUpload(decoder.write(data));
    });
    subprocess.stderr.on('data', function (data) {
      auditRamblersUpload(decoder.write(data), true);
    });
    subprocess.on('exit', function () {
      auditRamblersUpload('Upload completed for ' + fileName);
    });
    res.status(200).send(createSuccessResponse('Ramblers walks upload was successfully submitted via ' + fileName));

    function createSuccessResponse(responseData, information) {
      return {responseData: responseData, information: information};
    }

    function createErrorResponse(errorMessage, information) {
      return {responseData: [], error: errorMessage, information: information};
    }
  });

};