const config = require("../config/config");
const debug = require("debug")(config.logNamespace("mongoose-client"));
const mongoose = require("mongoose");
const transforms = require("../mongo/controllers/transforms");
let connected = false;
exports.create = (model, data) => {
  const debugCreate = require("debug")(config.logNamespace(`local-database:${model.modelName}`));
  debugCreate.enabled = true;
  const performCreate = () => {
    const document = transforms.createDocumentRequest({body: data});
    debugCreate("create:data:", data, "document:", document);
    return new model(document).save()
      .then(result => {
        return transforms.toObjectWithId(result);
      })
      .catch(error => {
        return {
          error: transforms.parseError(error),
          message: `Creation of ${model.modelName} failed`,
          request: data,
        };
      });
  };
  if (!connected) {
    debugCreate("establishing database connection");
    return exports.connect().then(() => performCreate());
  } else {
    return performCreate();
  }
};
exports.connect = () => {
  return mongoose.connect(config.mongo.uri, {
    keepAlive: 1,
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
  })
    .then((response) => {
      debug("Connected to database:", config.mongo.uri, "configured models:", response.models);
      connected = true;
      return true;
    })
    .catch((error) => {
      debug("Connection failed:", config.mongo.uri, "error:", error);
      throw error;
    });
};
