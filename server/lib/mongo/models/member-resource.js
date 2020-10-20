const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const mailchimpCampaign = {
  id: {type: String},
  web_id:{type: Number},
  list_id: {type: String},
  template_id:{type: Number},
  title: {type: String},
  subject: {type: String},
  saved_segment: {
    id:{type: Number},
    type: {type: String},
    name: {type: String},
  },
  status: {type: String},
  from_name: {type: String},
  archive_url_long: {type: String},
  create_time:{type: Number},
}

const memberResourceSchema = mongoose.Schema({
  data: {
    campaignSearchLimit: {type: Number},
    campaignSearchTerm: {type: String},
    campaignSearchField: {type: String},
    campaign: mailchimpCampaign,
    fileNameData: {
      originalFileName: {type: String},
      awsFileName: {type: String},
      title: {type: String},
    },
  },
  resourceType: {type: String},
  accessLevel: {type: String},
  createdDate: {type: Number},
  createdBy: {type: String},
  title: {type: String},
  resourceDate: {type: Number},
  description: {type: String},
  subject: {type: String}
}, {collection: "memberResources"});

memberResourceSchema.plugin(uniqueValidator);

module.exports = mongoose.model("member-resource", memberResourceSchema);
