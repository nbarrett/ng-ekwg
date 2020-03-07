const _ = require("lodash")
const config = require("../../config/config");
const authConfig = require("../../auth/auth-config");
const debug = require("debug")(config.logNamespace("database:member"));
const member = require("../models/member");
const transforms = require("./transforms");
const querystring = require("querystring");
const crudController = require("./../controllers/crud-controller").create(member);

exports.update = crudController.update
exports.all = crudController.all
exports.delete = crudController.delete
exports.findById = crudController.findById

exports.log = (req, res) => {
  authConfig.hashValue(req.body.password).then(hash => {
    res.status(201).json({
      userName: req.body.userName,
      password: req.body.password,
      passwordHash: hash,
      message: "password hashed successfully"
    })
      .catch(err => {
        res.status(500).json({
          message: "Invalid authentication credentials"
        });
      });
  });
}

exports.updateEmailSubscription = (req, res) => {
  const {criteria, document} = transforms.criteriaAndDocument(req);
  debug("updateEmailSubscription:", req.body, "conditions:", criteria, "request document:", document);
  member.findOneAndUpdate(criteria, document, {new: true, useFindAndModify: false})
    .then(result => {
      debug("update result:", result, "request document:", document);
      res.status(200).json({
        body: req.body,
        document,
        action: "update",
        response: result
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Update of member failed",
        request: document,
        error: transforms.parseError(error)
      });
    });
};


function findByConditions(conditions, res, req) {
  member.findOne(conditions)
    .then(member => {
      if (member) {
        res.status(200).json({
          action: "query",
          response: transforms.toObjectWithId(member)
        });
      } else {
        res.status(404).json({
          error: "member not found",
          request: conditions
        });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "member query failed",
        request: req.params.id,
        error: transforms.parseError(error)
      });
    });
}

exports.findByPasswordResetId = (req, res) => {
  debug("find - password-reset-id:", req.params.id)
  const conditions = {passwordResetId: req.params.id};
  findByConditions(conditions, res, req);
};

exports.findOne = (req, res) => {
  const conditions = querystring.parse(req.query);
  debug("find - by conditions", req.query, "conditions:", conditions)
  findByConditions(req.query, res, req);
};

exports.create = (req, res, next) => {
  const document = transforms.createDocumentRequest(req);
  const returnError = (error, context) => {
    res.status(500).json({
      message: "Unexpected error " + context,
      error: transforms.parseError(error),
      request: req.body,
    });
  };
  const createMember = (memberObject) => new member(memberObject).save()
    .then(result => {
      res.status(201).json({action: "create", response: transforms.toObjectWithId(result)});
    }).catch(error => returnError(error, "saving member"));

  if (req.body.password) {
    authConfig.hashValue(req.body.password)
      .then(password => {
        const documentWithPasswordEncrypted = _.extend({}, document, {password});
        createMember(documentWithPasswordEncrypted);
      }).catch(error => returnError(error, "encrypting password for member"));
  } else {
    createMember(document)
  }
}