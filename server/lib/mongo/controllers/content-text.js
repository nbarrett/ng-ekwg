const ContentText = require("../models/content-text");
const config = require("../../config/config");
const _ = require("underscore");
const debug = require("debug")(config.logNamespace("context-text"));

function normaliseObject(document) {
  return {
    id: document._id,
    ..._.omit(document._doc, ["_id", "__v"])
  }
}

exports.create = (req, res) => {
  const contentText = new ContentText({
    name: req.body.name,
    text: req.body.text,
    category: req.body.category
  });
  contentText
    .save()
    .then(createdContentText => {
      res.status(201).json({
        response: normaliseObject(createdContentText)
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Create of contentText failed",
        input: contentText,
        error: error
      });
    });
};

exports.update = (req, res) => {
  const contentText = new ContentText({
    _id: req.body.id,
    name: req.body.name,
    text: req.body.text,
    category: req.body.category
  });
  ContentText.updateOne({_id: req.params.id}, contentText)
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
        message: "Update of contentText failed",
        input: contentText,
        error: error
      });
    });
};

exports.all = (req, res) => {
  debug("all - req.params:", req.params.id)
  ContentText.find()
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
  ContentText.find(find).sort("name")
    .then(documents => {
      res.status(200).json({
        request: {
          type: type,
          value: value
        },
        response: documents.map(normaliseObject),
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
  ContentText.findOne(find)
    .then(document => {
      res.status(200).json({
        request: {
          type: type,
          value: value
        },
        response: normaliseObject(document),
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
  ContentText.findById(req.params.id)
    .then(contentText => {
      if (contentText) {
        res.status(200).json(normaliseObject(contentText));
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
  ContentText.deleteOne({_id: req.params.id})
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
