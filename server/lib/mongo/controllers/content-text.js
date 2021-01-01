const contentText = require("../models/content-text");
const {envConfig} = require("../../env-config/env-config");
const transforms = require("./transforms");
const debug = require("debug")(envConfig.logNamespace("context-text"));

exports.create = (req, res) => {
  new contentText({
    name: req.body.name,
    text: req.body.text,
    category: req.body.category
  }).save()
    .then(createdContentText => {
      res.status(201).json({
        response: transforms.toObjectWithId(createdContentText)
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Create of contentText failed",
        error: error
      });
    });
};

exports.update = (req, res) => {
  const contentTextDoc = new contentText({
    _id: req.body.id,
    name: req.body.name,
    text: req.body.text,
    category: req.body.category
  });
  contentText.updateOne({_id: req.params.id}, contentTextDoc)
    .then(result => {
      if (result.n > 0) {
        res.status(200).json({
          response: req.body
        });
      } else {
        res.status(401).json({message: "Not authorised"});
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "Update of contentTextDoc failed",
        input: contentTextDoc,
        error: error
      });
    });
};

exports.all = (req, res) => {
  debug("all - req.params:", req.params.id)
  contentText.find()
    .then(documents => {
      res.status(200).json({
        response: documents
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Fetching contentText failed"
      });
    });
};

exports.queryBy = function (type, value, res, req) {
  debug(`filtering - ${type}: ${value}`)
  const find = {};
  find[type] = value;
  contentText.find(find).sort("name")
    .then(documents => {
      res.status(200).json({
        request: {
          type: type,
          value: value
        },
        response: documents.map(transforms.toObjectWithId),
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Fetching contentText failed"
      });
    });
};

exports.findByName = (req, res) => {
  const type = "name";
  const value = req.params[type];
  debug(`find one - ${type}: ${value}`)
  const find = {};
  find[type] = value;
  contentText.findOne(find)
    .then(document => {
      res.status(200).json({
        request: {
          type: type,
          value: value
        },
        response: transforms.toObjectWithId(document),
      });
    })
    .catch(ignored => {
      res.status(200).json({
        request: {
          type: type,
          value: value
        },
        response: {},
      });
    });
};

exports.findByCategory = (req, res) => {
  const type = "category";
  const value = req.params[type];
  this.queryBy(type, value, res, req);
};

exports.findById = (req, res) => {
  debug("find - id:", req.params.id)
  contentText.findById(req.params.id)
    .then(contentText => {
      if (contentText) {
        res.status(200).json(transforms.toObjectWithId(contentText));
      } else {
        res.status(404).json({
          message: "contentText not found",
          request: req.params.id
        });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "contentText query failed",
        request: req.params.id,
        error: error
      });
    });
};

exports.delete = (req, res) => {
  contentText.deleteOne({_id: req.params.id})
    .then(result => {
      console.log(result);
      if (result.n > 0) {
        res.status(200).json({message: "Deletion successful"});
      } else {
        res.status(401).json({message: "Not authorised"});
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "Deletion of contentText failed",
        request: req.params.id,
        error: error
      });
    });
};
