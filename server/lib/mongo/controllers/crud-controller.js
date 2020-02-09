let _ = require("lodash");
const config = require("../../config/config");
const transforms = require("./transforms");

exports.create = (model) => {
  const debug = require("debug")(config.logNamespace(`database:${model.modelName}`));
  return {
    create: (req, res) => {
      const document = transforms.createDocumentRequest(req);
      debug("create:body:", req.body, "document:", document)
      new model(document).save()
        .then(result => {
          res.status(201).json({
            action: "create",
            response: transforms.toObjectWithId(result)
          });
        })
        .catch(error => res.status(500).json({
          message: `Creation of ${model.modelName} failed`,
          error: transforms.parseError(error),
          request: req.body,
        }))
    },
    update: (req, res) => {
      const {criteria, document} = transforms.criteriaAndDocument(req);
      debug("update:", req.body, "conditions:", criteria, "request document:", document);
      model.findOneAndUpdate(criteria, document, {new: true, useFindAndModify: false})
        .then(result => {
          debug("update result:", result, "request document:", document);
          res.status(200).json({
            body: req.body,
            document,
            action: "update",
            response: transforms.toObjectWithId(result)
          });
        })
        .catch(error => {
          res.status(500).json({
            message: `Update of ${model.modelName} failed`,
            request: document,
            error: transforms.parseError(error)
          });
        });
    },
    delete: (req, res) => {
      const criteria = transforms.criteria(req);
      debug("delete:", criteria)
      model.deleteOne(criteria)
        .then(result => {
          debug("deletedCount", result.deletedCount, "result:", result);
          res.status(200).json({
            action: "delete",
            response: {id: req.params.id}
          });
        })
        .catch(error => {
          res.status(500).json({
            message: `Delete of ${model.modelName} failed`,
            error: transforms.parseError(error)
          });
        });
    },
    all: (req, res) => {
      const parameters = transforms.parseQueryStringParameters(req);
      model.find(parameters.criteria).select(parameters.select).sort(parameters.sort)
        .then(results => {
          debug(req.query, "find - criteria:found", results.length, "documents")
          return res.status(200).json({
            action: "query",
            response: results.map(result => transforms.toObjectWithId(result))
          });
        })
        .catch(error => {
          debug("all:query", req.query, "error")
          res.status(500).json({
            message: `${model.modelName} query failed`,
            request: req.query,
            error: transforms.parseError(error)
          });
        });
    },
    findById: (req, res) => {
      debug("find - id:", req.params.id)
      model.findById(req.params.id)
        .then(result => {
          if (result) {
            res.status(200).json({
              action: "query",
              response: transforms.toObjectWithId(result)
            });
          } else {
            res.status(404).json({
              message: `${model.modelName} not found`,
              request: req.params.id
            });
          }
        })
        .catch(error => {
          res.status(500).json({
            message: `${model.modelName} query failed`,
            request: req.params.id,
            error: transforms.parseError(error)
          });
        });
    },
    findByConditions: (req, res) => {
      const parameters = transforms.parseQueryStringParameters(req);
      model.findOne(parameters.criteria).select(parameters.select)
        .then(result => {
          debug(req.query, "findByConditions:parameters", parameters, result, "documents")
          return res.status(200).json({
            action: "query",
            response: transforms.toObjectWithId(result)
          });
        })
        .catch(error => {
          debug(`findByConditions: ${model.modelName} error`)
          res.status(500).json({
            message: `${model.modelName} query failed`,
            request: req.query,
            error: transforms.parseError(error)
          });
        });
    }
  }
}



