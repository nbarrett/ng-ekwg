const _ = require("lodash")
const config = require("../../config/config");
const authConfig = require("../../auth/auth-config");
const debug = require("debug")(config.logNamespace("database:member"));
const member = require("../models/member");
const transforms = require("./transforms");
const querystring = require("querystring");

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

exports.update = (req, res) => {
  const {criteria, document} = transforms.criteriaAndDocument(req);
  debug("update:", req.body, "conditions:", criteria, "input document:", document);
  member.findOneAndUpdate(criteria, document, {new: true, useFindAndModify: false})
    .then(result => {
      debug("update result:", result, "input document:", document);
      res.status(200).json({
        body: req.body,
        document,
        response: result
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Update of member failed",
        input: document,
        error: error
      });
    });
};

exports.findById = (req, res) => {
  debug("find - id:", req.params.id)
  member.findById(req.params.id)
    .then(member => {
      if (member) {
        res.status(200).json(transforms.toObjectWithId(member));
      } else {
        res.status(404).json({
          message: "member not found",
          request: req.params.id
        });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "member query failed",
        request: req.params.id,
        error: error.toString()
      });
    });
};

function findByConditions(conditions, res, req) {
  member.findOne(conditions)
    .then(member => {
      if (member) {
        res.status(200).json(transforms.toObjectWithId(member));
      } else {
        res.status(404).json({
          message: "member not found",
          request: conditions
        });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "member query failed",
        request: req.params.id,
        error: error.toString()
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

exports.all = (req, res) => {
  debug("find - all:query", req.query)
  member.find({}).select(req.query)
    .then(members => res.status(200).json(members.map(member => transforms.toObjectWithId(member))))
    .catch(error => {
      res.status(500).json({
        message: "member query failed",
        request: req.query,
        error: error.toString()
      });
    });
};

exports.create = (req, res, next) => {
  authConfig.hashValue(req.body.password).then(hash => {
    new member({
      userName: req.body.userName,
      password: hash
    }).save()
      .then(result => {
        res.status(201).json({
          userName: req.body.userName,
          message: "auth created!"
        });
      })
      .catch(err => {
        res.status(500).json({
          message: "Invalid authentication credentials"
        });
      });
  });
}
